"""
Environment / configuration loading.
Reads everything from process env vars (populated from .env in local dev via python-dotenv,
or injected directly by the platform in Railway/Render).
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Core ---
    ENV: str = "development"
    DEV_MODE_ENABLED: bool = False  # gates /api/dev/* routes (see teammates/router.py level-slider note)

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/crewmate"

    # --- Firebase Auth ---
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "./firebase-service-account.json"
    FIREBASE_SERVICE_ACCOUNT_JSON: str | None = None

    # --- LLM providers (agent engine) ---
    GROQ_API_KEY: str | None = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GEMINI_API_KEY: str | None = None

    # --- CORS ---
    FRONTEND_ORIGIN: str = "http://localhost:3000"

    # --- Google OAuth ---
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"
    OAUTH_STATE_SECRET: str = "change-me-in-production-super-secret"
    TOKEN_ENCRYPTION_KEY: str = "12345678901234567890123456789012" # 32 bytes

    # --- Anonymous landing-page demo rate limiting ---
    AGENT_DEMO_RATE_LIMIT_PER_HOUR: int = 10


@lru_cache
def get_settings() -> Settings:
    return Settings()
