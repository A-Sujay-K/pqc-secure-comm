from __future__ import annotations
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # MongoDB
    MONGODB_URI: str = "mongodb://pqc_user:pqc_pass@localhost:27017/pqc_secure_comm?authSource=admin"
    MONGODB_DB_NAME: str = "pqc_secure_comm"

    # Redis
    REDIS_URI: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET: str = "change-me-to-a-random-secret-key-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60

    # QKD daemon
    QKD_GENERATION_INTERVAL: int = 10
    THREAT_THRESHOLD: float = 0.7
    W1: float = 0.4
    W2: float = 0.3
    W3: float = 0.3

    # File uploads
    MAX_FILE_SIZE_MB: int = 25

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:5174"]

    # Logging
    LOG_LEVEL: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
