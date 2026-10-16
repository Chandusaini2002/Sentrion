"""
Central application configuration.

All values are read from environment variables (see .env.example), never
hard-coded. pydantic-settings loads a local .env file automatically during
development; in production, real environment variables take over.
"""
from functools import lru_cache
from typing import Literal
from pydantic import Field, field_validator

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Application ---
    PROJECT_NAME: str = "Sentrion API"
    ENVIRONMENT: str = "development"
    API_PREFIX: str = "/api"
    API_VERSION: str = "0.1.0"

    # --- Database ---
    DATABASE_URL: str

    # --- CORS ---
    # Comma-separated origins in the .env file, parsed into a list here.
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # --- MediaMTX (local development defaults) ---
    MEDIAMTX_API_URL: str = "http://127.0.0.1:9997"
    MEDIAMTX_WEBRTC_URL: str = "http://127.0.0.1:8889"
    MEDIAMTX_HLS_URL: str = "http://127.0.0.1:8888"

    # --- Authentication ---
    CAMERA_ENCRYPTION_KEY: str

    @field_validator("CAMERA_ENCRYPTION_KEY")
    @classmethod
    def valid_camera_key(cls, value: str) -> str:
        from cryptography.fernet import Fernet
        try:
            Fernet(value.encode())
        except (ValueError, TypeError):
            raise ValueError("Set CAMERA_ENCRYPTION_KEY to a generated Fernet key.") from None
        return value

    SECRET_KEY: str = Field(min_length=32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60, ge=1, le=1440)
    JWT_ALGORITHM: Literal["HS256"] = "HS256"

    @field_validator("SECRET_KEY")
    @classmethod
    def reject_placeholder(cls, value: str) -> str:
        if "change" in value.lower() or "replace" in value.lower():
            raise ValueError("Generate a random SECRET_KEY before starting the API.")
        return value

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance — env is only parsed once per process."""
    return Settings()


settings = get_settings()
