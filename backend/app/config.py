import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    APP_NAME: str = "EXAMHUB INDIA"
    APP_ENV: str = "development"
    SECRET_KEY: str = "examhub-india-super-secure-production-ready-jwt-secret-key-32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./examhub_india.db"
    SYNC_DATABASE_URL: str = "sqlite:///./examhub_india.db"
    
    # Document storage
    STORAGE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage"))
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".jpg", ".jpeg", ".png"]
    
    # Admin Defaults
    SUPERADMIN_EMAIL: str = "superadmin@examhub.gov.in"
    SUPERADMIN_PASSWORD: str = "SuperAdmin@ExamHub2026!"

settings = Settings()
