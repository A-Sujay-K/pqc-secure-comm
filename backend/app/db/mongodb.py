from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from loguru import logger
import pymongo

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None

async def init_mongodb(uri: str, db_name: str):
    global _client, _db
    logger.info("Initializing MongoDB connection...")
    _client = AsyncIOMotorClient(uri)
    _db = _client[db_name]
    
    # Create indexes
    try:
        await _db["users"].create_index([("username", pymongo.ASCENDING), ("email", pymongo.ASCENDING)], unique=True)
        await _db["messages"].create_index([("sender_id", pymongo.ASCENDING), ("recipient_id", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)])
        await _db["qkd_keys"].create_index([("consumed", pymongo.ASCENDING), ("generated_at", pymongo.ASCENDING)])
        await _db["telemetry_events"].create_index([("timestamp", pymongo.DESCENDING)])
        logger.info("MongoDB indexes created successfully.")
    except Exception as e:
        logger.error(f"Error creating MongoDB indexes: {e}")

def get_database() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("MongoDB is not initialized.")
    return _db

async def close_mongodb():
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB connection closed.")
