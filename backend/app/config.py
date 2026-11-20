import json
from functools import lru_cache
from typing import Union
from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    MONGODB_URI: str = Field(
        default="mongodb://pqc_user:pqc_pass@localhost:27017/pqc_secure_comm?authSource=admin",
        validation_alias=AliasChoices("MONGODB_URI", "MONGODB_URL")
    )
    MONGODB_DB_NAME: str = "pqc_secure_comm"
    REDIS_URI: str = Field(
        default="redis://localhost:6379/0",
        validation_alias=AliasChoices("REDIS_URI", "REDIS_URL")
    )
    JWT_SECRET: str = "change-me-to-a-random-secret-key-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60
    QKD_GENERATION_INTERVAL: int = 12
    THREAT_THRESHOLD: float = 0.8
    W1: float = 0.6
    W2: float = 0.4
    W3: float = 0.0  # Kept for backward compatibility
    K_MAX: int = 25
    TAU_MIN: float = 0.4
    TAU_MAX: float = 0.8
    S_CRIT: float = 0.85
    DELIVERY_DEADLINE: float = 5.0
    MAX_FILE_SIZE_MB: int = 25
    CORS_ORIGINS: Union[list[str], str] = ["http://localhost:5173", "http://localhost:5174"]
    LOG_LEVEL: str = "INFO"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

@lru_cache
def get_settings() -> Settings:
    return Settings()
