import os
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")

    APP_NAME: str = "EXAMHUB INDIA"
    APP_ENV: str = "development"
    SECRET_KEY: str = "development-only-secret-change-before-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    FRONTEND_ORIGINS: list[str] = ["http://localhost:3000"]
    PUBLIC_BASE_URL: str = "http://localhost:3000"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./examhub_india.db"
    SYNC_DATABASE_URL: str = "sqlite:///./examhub_india.db"
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_AUTH_ENABLED: bool = False
    FIRESTORE_SQLITE_PERSISTENCE: bool = False
    
    # Document storage
    STORAGE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage"))
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".jpg", ".jpeg", ".png"]
    
    # Admin Defaults
    SUPERADMIN_EMAIL: str = os.getenv("SUPERADMIN_EMAIL", "")
    SUPERADMIN_PASSWORD: str = os.getenv("SUPERADMIN_PASSWORD", "")

    # Social Channels
    INSTAGRAM_USERNAME: str = os.getenv("INSTAGRAM_USERNAME", "@the_smiley_hacker_5933z")
    INSTAGRAM_URL: str = os.getenv("INSTAGRAM_URL", "https://www.instagram.com/the_smiley_hacker_5933z/")

    @model_validator(mode="after")
    def require_production_secrets(self):
        if (self.FIREBASE_AUTH_ENABLED or self.FIRESTORE_SQLITE_PERSISTENCE) and not self.FIREBASE_PROJECT_ID:
            raise ValueError("Firebase Authentication or persistence requires FIREBASE_PROJECT_ID")
        if self.APP_ENV.lower() == "production":
            if len(self.SECRET_KEY) < 32 or self.SECRET_KEY == "development-only-secret-change-before-production":
                raise ValueError("Production requires a unique SECRET_KEY of at least 32 characters")
            if len(self.SUPERADMIN_PASSWORD) < 14:
                raise ValueError("Production requires a unique SUPERADMIN_PASSWORD of at least 14 characters")
            if not self.SUPERADMIN_EMAIL or "@" not in self.SUPERADMIN_EMAIL:
                raise ValueError("Production requires a valid SUPERADMIN_EMAIL")
            if not self.FRONTEND_ORIGINS or any(not origin.startswith("https://") for origin in self.FRONTEND_ORIGINS):
                raise ValueError("Production FRONTEND_ORIGINS must list the HTTPS frontend origin")
            if not self.PUBLIC_BASE_URL.startswith("https://") or not all((self.SMTP_HOST, self.SMTP_USERNAME, self.SMTP_PASSWORD, self.SMTP_FROM)):
                raise ValueError("Production requires HTTPS PUBLIC_BASE_URL and configured SMTP credentials")
        return self

settings = Settings()
