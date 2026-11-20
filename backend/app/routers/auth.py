import secrets
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.models import User, UserSession, NotificationPreference
from app.schemas.schemas import UserRegister, UserLogin, SendOtpRequest, VerifyOtpRequest, Token, UserOut
from app.auth.security import hash_password, verify_password, create_access_token, generate_otp, verify_otp, get_current_user
from app.services.audit_service import log_audit_event
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegister, request: Request, db: AsyncSession = Depends(get_db)):
    if req.password != req.password_confirm:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match")
    
    # Check existing email
    stmt = select(User).where(User.email == req.email.lower().strip())
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")
    
    # Check mobile if provided
    if req.mobile:
        stmt_m = select(User).where(User.mobile == req.mobile.strip())
        existing_m = (await db.execute(stmt_m)).scalar_one_or_none()
        if existing_m:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this mobile number already exists")
    
    user = User(
        full_name=req.full_name.strip(),
        email=req.email.lower().strip(),
        mobile=req.mobile.strip() if req.mobile else None,
        password_hash=hash_password(req.password),
        is_active=True,
        is_verified=False
    )
    db.add(user)
    await db.flush()

    # Create default notification preference
    pref = NotificationPreference(user_id=user.id)
    db.add(pref)
    await db.commit()
    await db.refresh(user)

    client_ip = request.client.host if request.client else "127.0.0.1"
    await log_audit_event(
        db,
        actor_type="USER",
        actor_id=user.id,
        action="USER_REGISTRATION",
        target_type="USER",
        target_id=user.id,
        details={"email": user.email},
        ip_address=client_ip
    )

    token = create_access_token({"sub": str(user.id), "email": user.email, "type": "student"})
    return Token(
        access_token=token,
        token_type="bearer",
        user_type="student",
        user={
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "mobile": user.mobile,
            "is_verified": user.is_verified,
            "mobile_verified": user.mobile_verified
        }
    )

@router.post("/login", response_model=Token)
async def login(req: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == req.email.lower().strip(), User.is_active == True, User.deleted_at.is_(None))
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    token = create_access_token({"sub": str(user.id), "email": user.email, "type": "student"})
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")

    # Record active session with unique session token
    session = UserSession(
        user_id=user.id,
        session_token=secrets.token_hex(32),
        ip_address=client_ip,
        user_agent=user_agent,
        expires_at=datetime.now(timezone.utc) + timedelta(days=1)
    )
    db.add(session)
    await db.commit()

    await log_audit_event(
        db,
        actor_type="USER",
        actor_id=user.id,
        action="USER_LOGIN",
        target_type="USER",
        target_id=user.id,
        ip_address=client_ip
    )

    return Token(
        access_token=token,
        token_type="bearer",
        user_type="student",
        user={
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "mobile": user.mobile,
            "is_verified": user.is_verified,
            "mobile_verified": user.mobile_verified
        }
    )

@router.post("/send-otp")
async def send_otp(req: SendOtpRequest):
    otp = generate_otp(req.mobile)
    return {
        "success": True,
        "message": f"OTP sent to {req.mobile[:2]}******{req.mobile[-2:]}. Valid for 5 minutes.",
        "debug_demo_otp": otp
    }

@router.post("/verify-otp", response_model=Token)
async def verify_login_otp(req: VerifyOtpRequest, request: Request, db: AsyncSession = Depends(get_db)):
    if not verify_otp(req.mobile, req.otp):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")
    
    stmt = select(User).where(User.mobile == req.mobile)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        user = User(
            full_name=f"Student {req.mobile[-4:]}",
            email=f"{req.mobile}@student.examhub.in",
            mobile=req.mobile,
            password_hash=hash_password("OtpAutoGenerated123!"),
            is_active=True,
            is_verified=True,
            mobile_verified=True
        )
        db.add(user)
        await db.flush()
        pref = NotificationPreference(user_id=user.id)
        db.add(pref)
        await db.commit()
        await db.refresh(user)
    else:
        user.mobile_verified = True
        await db.commit()

    token = create_access_token({"sub": str(user.id), "email": user.email, "type": "student"})
    return Token(
        access_token=token,
        token_type="bearer",
        user_type="student",
        user={
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "mobile": user.mobile,
            "is_verified": user.is_verified,
            "mobile_verified": user.mobile_verified
        }
    )

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(UserSession).where(UserSession.user_id == current_user.id, UserSession.is_revoked == False)
    sessions = (await db.execute(stmt)).scalars().all()
    for s in sessions:
        s.is_revoked = True
    await db.commit()
    return {"success": True, "message": "Successfully logged out"}
