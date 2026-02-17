from __future__ import annotations
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from loguru import logger

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def init_mongodb(uri: str, db_name: str) -> None:
    """Initialize the MongoDB client and create required indexes."""
    global _client, _db
    _client = AsyncIOMotorClient(uri)
    _db = _client[db_name]
    logger.info(f"Connected to MongoDB database: {db_name}")

    await _create_indexes()


async def _create_indexes() -> None:
    """Create performance indexes on all collections."""
    # Users collection
    await _db["users"].create_index("username", unique=True)
    await _db["users"].create_index("email", unique=True)

    # Messages collection
    await _db["messages"].create_index([("sender_id", 1), ("recipient_id", 1)])
    await _db["messages"].create_index("created_at")

    # QKD Keys collection
    await _db["qkd_keys"].create_index("consumed")
    await _db["qkd_keys"].create_index("generated_at")

    logger.info("MongoDB indexes created successfully")


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database instance."""
    if _db is None:
        raise RuntimeError("MongoDB has not been initialized. Call init_mongodb() first.")
    return _db


async def close_mongodb() -> None:
    """Close the MongoDB client connection."""
    global _client
    if _client:
        _client.close()
        _client = None
        logger.info("MongoDB connection closed")
