import redis.asyncio as redis
from typing import Optional
from loguru import logger

_redis: Optional[redis.Redis] = None

def _sanitize_redis_uri(uri: str) -> str:
    """Sanitize and validate Redis URI to prevent common scheme/format errors."""
    cleaned = uri.strip().strip('"').strip("'")
    
    # Check if user mistakenly pasted Upstash REST HTTPS URL
    if cleaned.startswith("https://") or cleaned.startswith("http://"):
        logger.warning(
            "REDIS_URI starts with http(s)://. Upstash REST API is not redis protocol. "
            "Please use the standard Redis connection string: rediss://default:<password>@<endpoint>:6379"
        )
        cleaned = cleaned.replace("https://", "rediss://").replace("http://", "redis://")

    # If scheme is missing entirely, auto-detect
    if not (cleaned.startswith("redis://") or cleaned.startswith("rediss://") or cleaned.startswith("unix://")):
        if "upstash.io" in cleaned or "rediss" in cleaned:
            cleaned = f"rediss://{cleaned}"
        else:
            cleaned = f"redis://{cleaned}"
        logger.info(f"Auto-formatted Redis URI with scheme: {cleaned[:15]}...")

    return cleaned

async def init_redis(uri: str):
    global _redis
    logger.info("Initializing Redis connection...")
    
    clean_uri = _sanitize_redis_uri(uri)
    try:
        _redis = redis.from_url(clean_uri, decode_responses=True)
        await _redis.ping()
        logger.info("Redis connection established.")
    except Exception as e:
        logger.error(f"Error connecting to Redis ({clean_uri[:20]}...): {e}")
        logger.error(
            "Please verify REDIS_URI in your environment variables. "
            "Format must be: rediss://default:<password>@<endpoint>:6379 (for Upstash/TLS) or redis://<host>:6379"
        )
        raise

def get_redis() -> redis.Redis:
    if _redis is None:
        raise RuntimeError("Redis is not initialized.")
    return _redis

async def close_redis():
    global _redis
    if _redis:
        await _redis.close()
        logger.info("Redis connection closed.")
