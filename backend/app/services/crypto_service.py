import base64
import hashlib
from cryptography.fernet import Fernet
from app.config import settings

def _get_fernet_key() -> bytes:
    """Derives a deterministic 32-byte urlsafe base64 key from settings.SECRET_KEY."""
    raw_hash = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    return base64.urlsafe_b64encode(raw_hash)

def encrypt_secret(plain_text: str) -> str:
    """Encrypts sensitive credentials (API keys, client secrets, auth tokens) for secure storage."""
    if not plain_text:
        return ""
    fernet = Fernet(_get_fernet_key())
    encrypted = fernet.encrypt(plain_text.encode())
    return encrypted.decode()

def decrypt_secret(cipher_text: str) -> str:
    """Decrypts encrypted credentials for authorized internal use."""
    if not cipher_text:
        return ""
    try:
        fernet = Fernet(_get_fernet_key())
        decrypted = fernet.decrypt(cipher_text.encode())
        return decrypted.decode()
    except Exception as e:
        print(f"Decryption error: {e}")
        return ""

def mask_secret(secret_text: str) -> str:
    """Masks secret so it is never exposed in plaintext to the frontend or ordinary users."""
    if not secret_text:
        return ""
    if len(secret_text) <= 8:
        return "••••••••"
    return f"{secret_text[:4]}••••••••{secret_text[-4:]}"
