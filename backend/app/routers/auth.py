import secrets
import hashlib
import smtplib
from email.message import EmailMessage
from email.utils import formataddr
from fastapi import BackgroundTasks
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.config import settings
from app.database import get_db
from app.models.models import User, UserSession, NotificationPreference, PasswordResetToken, AdminUser
from app.schemas.schemas import UserRegister, UserLogin, SendOtpRequest, VerifyOtpRequest, Token, UserOut, ForgotPasswordRequest, ResetPasswordRequest
from app.auth.security import hash_password, verify_password, create_access_token, generate_otp, verify_otp, get_current_user
from app.services.audit_service import log_audit_event
from datetime import datetime, timezone, timedelta


def deliver_password_reset_email(email: str, full_name: str, reset_url: str) -> None:
    """Send account recovery out of band; never return recovery tokens in API responses."""
    message = EmailMessage()
    message["Subject"] = "Reset your ExamHub India password"
    message["From"] = formataddr(("ExamHub India", settings.SMTP_FROM))
    message["To"] = email
    message.set_content(
        f"Hello {full_name},\n\nUse this one-time link to reset your password. It expires in 15 minutes:\n{reset_url}\n\n"
        "If you did not request this change, you can ignore this email."
    )
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
        smtp.starttls()
        smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        smtp.send_message(message)

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
    email_clean = req.email.lower().strip()
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")

    # 1. First verify if it's a student account
    stmt = select(User).where(User.email == email_clean, User.is_active == True, User.deleted_at.is_(None))
    user = (await db.execute(stmt)).scalar_one_or_none()
    if user:
        if verify_password(req.password, user.password_hash):
            token = create_access_token({"sub": str(user.id), "email": user.email, "type": "student"})
            
            # Record active student session
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
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password entered. Please verify your password."
            )

    # 2. Check if it's an administrator account logging in
    stmt_admin = select(AdminUser).options(selectinload(AdminUser.role)).where(
        AdminUser.email == email_clean,
        AdminUser.is_active == True
    )
    admin = (await db.execute(stmt_admin)).scalar_one_or_none()
    if admin:
        if verify_password(req.password, admin.password_hash):
            admin.last_login_at = datetime.now(timezone.utc)
            await db.commit()
            admin_token = create_access_token({"sub": str(admin.id), "email": admin.email, "type": "admin"})

            await log_audit_event(
                db,
                actor_type="ADMIN",
                actor_id=admin.id,
                action="ADMIN_LOGIN",
                target_type="ADMIN",
                target_id=admin.id,
                ip_address=client_ip
            )

            return Token(
                access_token=admin_token,
                token_type="bearer",
                user_type="admin",
                user={
                    "id": admin.id,
                    "full_name": admin.full_name,
                    "email": admin.email,
                    "role": admin.role.name if admin.role else "SUPER_ADMIN"
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password entered. Please verify your password."
            )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No account found matching this email address. Please check spelling or create an account."
    )

@router.post("/send-otp")
async def send_otp(req: SendOtpRequest):
    raise HTTPException(status_code=503, detail="Mobile OTP delivery is not configured")

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

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, request: Request, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    identifier = req.identifier.strip().lower()
    stmt = select(User).where(
        (User.email == identifier) | (User.mobile == identifier),
        User.is_active == True,
        User.deleted_at.is_(None)
    )
    user = (await db.execute(stmt)).scalar_one_or_none()

    if user:
        reset_token = secrets.token_urlsafe(32)
        expires = datetime.now(timezone.utc) + timedelta(minutes=15)
        client_ip = request.client.host if request.client else "127.0.0.1"

        token_entry = PasswordResetToken(
            user_id=user.id,
            reset_token=hashlib.sha256(reset_token.encode()).hexdigest(),
            expires_at=expires,
            is_used=False,
            ip_address=client_ip
        )
        db.add(token_entry)
        await db.commit()
        reset_url = f"{settings.PUBLIC_BASE_URL.rstrip('/')}/auth/forgot-password?token={reset_token}"
        background_tasks.add_task(deliver_password_reset_email, user.email, user.full_name, reset_url)

        await log_audit_event(
            db,
            actor_type="USER",
            actor_id=user.id,
            action="PASSWORD_RESET_REQUESTED",
            target_type="USER",
            target_id=user.id,
            ip_address=client_ip
        )

    # Return non-enumerating generic response
    return {
        "success": True,
        "message": "If an account matches your details, recovery instructions will be sent to its registered email address."
    }

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, request: Request, db: AsyncSession = Depends(get_db)):
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match")
    if len(req.new_password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters")

    stmt = select(PasswordResetToken).where(
        PasswordResetToken.reset_token == hashlib.sha256(req.token.strip().encode()).hexdigest(),
        PasswordResetToken.is_used == False
    )
    token_entry = (await db.execute(stmt)).scalar_one_or_none()

    if not token_entry:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired recovery token")

    now = datetime.now(timezone.utc)
    # Check expiry
    token_expires = token_entry.expires_at
    if token_expires.tzinfo is None:
        token_expires = token_expires.replace(tzinfo=timezone.utc)
    if token_expires < now:
        token_entry.is_used = True
        await db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Recovery token has expired. Please request a new one.")

    # Fetch user
    user_stmt = select(User).where(User.id == token_entry.user_id)
    user = (await db.execute(user_stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")

    user.password_hash = hash_password(req.new_password)
    token_entry.is_used = True

    # Revoke all active sessions
    session_stmt = select(UserSession).where(UserSession.user_id == user.id, UserSession.is_revoked == False)
    sessions = (await db.execute(session_stmt)).scalars().all()
    for s in sessions:
        s.is_revoked = True

    await db.commit()

    client_ip = request.client.host if request.client else "127.0.0.1"
    await log_audit_event(
        db,
        actor_type="USER",
        actor_id=user.id,
        action="PASSWORD_RESET_COMPLETED",
        target_type="USER",
        target_id=user.id,
        ip_address=client_ip
    )

    return {"success": True, "message": "Password successfully reset. You may now log in with your new credentials."}
