from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://pqc_user:pqc_pass@localhost:27017/pqc_secure_comm?authSource=admin"
    MONGODB_DB_NAME: str = "pqc_secure_comm"
    REDIS_URI: str = "redis://localhost:6379/0"
    JWT_SECRET: str = "change-me-to-a-random-secret-key-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60
    QKD_GENERATION_INTERVAL: int = 10
    THREAT_THRESHOLD: float = 0.8
    W1: float = 0.6
    W2: float = 0.4
    W3: float = 0.0  # Kept for backward compatibility
    K_MAX: int = 20
    TAU_MIN: float = 0.4
    TAU_MAX: float = 0.8
    S_CRIT: float = 0.85
    DELIVERY_DEADLINE: float = 5.0
    MAX_FILE_SIZE_MB: int = 25
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:5174"]
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

@lru_cache
def get_settings() -> Settings:
    return Settings()
