from loguru import logger
from app.models.key_entry import create_key_doc, COLLECTION as KEYS_COL
from app.utils.constants import KEY_POOL_SET_KEY

from app.config import get_settings

async def add_key(db, redis_client, key_hex: str) -> str | None:
    """
    Inserts a newly generated key into MongoDB and Redis available pool,
    enforcing reservoir capacity K_max.
    """
    settings = get_settings()
    current_count = await get_available_count(redis_client)
    if current_count >= settings.K_MAX:
        logger.debug(f"Key pool at capacity ({current_count}/{settings.K_MAX}). Key discarded.")
        return None

    key_doc = create_key_doc(key_hex=key_hex)
    
    # 1. Store in MongoDB
    result = await db[KEYS_COL].insert_one(key_doc)
    
    # 2. Add to Redis Set
    await redis_client.sadd(KEY_POOL_SET_KEY, key_hex)
    
    return str(result.inserted_id)

async def consume_key(db, redis_client) -> str | None:
    """
    Retrieves and removes a key from the Redis available pool, marks it consumed in MongoDB.
    """
    # 1. Pop from Redis (atomic)
    key_hex = await redis_client.spop(KEY_POOL_SET_KEY)
    
    if not key_hex:
        return None
        
    # 2. Mark consumed in MongoDB
    from datetime import datetime, timezone
    await db[KEYS_COL].update_one(
        {"key_hex": key_hex},
        {"$set": {"consumed": True, "consumed_at": datetime.now(timezone.utc)}}
    )
    
    return key_hex

async def get_available_count(redis_client) -> int:
    """
    Returns the number of keys currently in the Redis available pool.
    """
    return await redis_client.scard(KEY_POOL_SET_KEY)

async def get_pool_stats(db, redis_client) -> dict:
    """
    Returns comprehensive stats about the key pool.
    """
    available = await get_available_count(redis_client)
    total_generated = await db[KEYS_COL].count_documents({})
    consumed = await db[KEYS_COL].count_documents({"consumed": True})
    
    return {
        "available": available,
        "total_generated": total_generated,
        "consumed": consumed
    }
