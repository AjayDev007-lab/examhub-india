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
    SUPERADMIN_EMAIL: str = os.getenv("SUPERADMIN_EMAIL", "ajaydevvs22102004@gmail.com")
    SUPERADMIN_PASSWORD: str = os.getenv("SUPERADMIN_PASSWORD", "SuperAdmin@ExamHub2026!")

    # Social Channels
    INSTAGRAM_USERNAME: str = os.getenv("INSTAGRAM_USERNAME", "@the_smiley_hacker_5933z")
    INSTAGRAM_URL: str = os.getenv("INSTAGRAM_URL", "https://www.instagram.com/the_smiley_hacker_5933z/")

settings = Settings()
