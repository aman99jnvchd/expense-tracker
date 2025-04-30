from pydantic_settings import BaseSettings  # ✅ For Pydantic v2+
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/expense_db")

class Settings(BaseSettings):
    DATABASE_URL: str = DATABASE_URL
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    class Config:
        env_file = ".env"

settings = Settings()
