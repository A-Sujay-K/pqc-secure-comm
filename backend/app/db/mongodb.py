from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from loguru import logger
import pymongo

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None

async def init_mongodb(uri: str, db_name: str):
    global _client, _db
    logger.info("Initializing MongoDB connection...")
    
    clean_uri = uri.strip().strip('"').strip("'")
    _client = AsyncIOMotorClient(clean_uri)
    _db = _client[db_name]
    
    # Verify connectivity and authentication with ping
    try:
        await _client.admin.command('ping')
        logger.info("MongoDB connection and authentication verified.")
    except Exception as e:
        logger.error(f"MongoDB authentication / connection check failed: {e}")
        logger.error(
            "Please check MONGODB_URI in Render environment variables:\n"
            "1. Did you replace '<password>' with your actual password (and remove the angle brackets)?\n"
            "2. Ensure the Database User exists in Atlas under Security -> Database Access with Read/Write permissions.\n"
            "3. If your password has special characters (@, #, :), URL-encode them or use an alphanumeric password."
        )
        raise
    
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
