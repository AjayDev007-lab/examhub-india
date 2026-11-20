import datetime
import random
import hmac
import hashlib
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import settings
from app.database import get_db
from app.models.models import User, AdminUser, UserSession

# Argon2id password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
security_bearer = HTTPBearer(auto_error=False)

# In-memory OTP storage for secure demo/mock SMS validation (Mobile -> {otp_hash, expires_at})
_OTP_STORE: Dict[str, Dict[str, Any]] = {}

def hash_password(password: str) -> str:
    """Hashes a password using Argon2id."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against an Argon2id hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    """Generates a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.datetime.now(datetime.timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def generate_otp(mobile: str) -> str:
    """Generates a secure 6-digit OTP and stores its SHA-256 hash with a 5-minute expiry."""
    # Deterministic test code for standard test mobile or random 6 digits
    if mobile == "9876543210":
        otp = "123456"
    else:
        otp = f"{random.randint(100000, 999999)}"
    
    otp_hash = hashlib.sha256(otp.encode()).hexdigest()
    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=5)
    _OTP_STORE[mobile] = {
        "hash": otp_hash,
        "expires_at": expires_at
    }
    return otp

def verify_otp(mobile: str, entered_otp: str) -> bool:
    """Verifies an OTP against its stored hash and checks expiry."""
    entry = _OTP_STORE.get(mobile)
    if not entry:
        return False
    if datetime.datetime.now(datetime.timezone.utc) > entry["expires_at"]:
        del _OTP_STORE[mobile]
        return False
    entered_hash = hashlib.sha256(entered_otp.encode()).hexdigest()
    if hmac.compare_digest(entry["hash"], entered_hash):
        del _OTP_STORE[mobile]
        return True
    return False

async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db)
) -> User:
    """FastAPI dependency to extract and verify the current authenticated student."""
    if not auth:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(auth.credentials)
    if not payload or payload.get("type") != "student":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    stmt = select(User).where(User.id == int(user_id), User.is_active == True, User.deleted_at.is_(None))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or has been deactivated"
        )
    return user

async def get_optional_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """FastAPI dependency to extract the student if token is present, else None."""
    if not auth:
        return None
    payload = decode_access_token(auth.credentials)
    if not payload or payload.get("type") != "student":
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    stmt = select(User).where(User.id == int(user_id), User.is_active == True, User.deleted_at.is_(None))
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

get_current_user_optional = get_optional_user

async def get_current_admin(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db)
) -> AdminUser:
    """FastAPI dependency to extract and verify the current authenticated admin."""
    if not auth:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(auth.credentials)
    if not payload or payload.get("type") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required"
        )
    admin_id = payload.get("sub")
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token"
        )
    stmt = select(AdminUser).where(AdminUser.id == int(admin_id), AdminUser.is_active == True)
    result = await db.execute(stmt)
    admin = result.scalar_one_or_none()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account deactivated or not found"
        )
    return admin

async def get_optional_admin(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db)
) -> Optional[AdminUser]:
    """FastAPI dependency to extract the admin if token is present, else None."""
    if not auth:
        return None
    payload = decode_access_token(auth.credentials)
    if not payload or payload.get("type") != "admin":
        return None
    admin_id = payload.get("sub")
    if not admin_id:
        return None
    stmt = select(AdminUser).where(AdminUser.id == int(admin_id), AdminUser.is_active == True)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

def require_role(allowed_roles: list[str]):
    """Role-based authorization dependency factory."""
    async def role_checker(
        admin: AdminUser = Depends(get_current_admin),
        db: AsyncSession = Depends(get_db)
    ) -> AdminUser:
        from app.models.models import AdminRole
        stmt = select(AdminRole).where(AdminRole.id == admin.role_id)
        res = await db.execute(stmt)
        role = res.scalar_one_or_none()
        if not role or role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of: {', '.join(allowed_roles)}"
            )
        return admin
    return role_checker
