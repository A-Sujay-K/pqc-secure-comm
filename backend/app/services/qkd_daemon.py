import asyncio
import os
from loguru import logger
from app.config import get_settings
from app.db.mongodb import get_database
from app.db.redis_client import get_redis
from app.services.key_pool_service import add_key
from app.core.priority_queue import release_queued_messages
from app.models.telemetry_event import create_telemetry_event
from app.services.telemetry_service import record_event
from app.ws.connection_manager import manager as connection_manager
import app.core.crypto_engine as crypto_engine
import app.services.key_pool_service as key_pool_service

_task: asyncio.Task | None = None

async def _generate_key_loop():
    """
    Infinite loop: periodically generates QKD keys and releases buffered messages.
    """
    settings = get_settings()
    db = get_database()
    redis_client = get_redis()
    
    logger.info(f"QKD Daemon started. Generating key every {settings.QKD_GENERATION_INTERVAL} seconds.")
    
    while True:
        try:
            # 1. Generate 256-bit key
            key_bytes = os.urandom(32)
            key_hex = key_bytes.hex()
            
            # 2. Store key
            await add_key(db, redis_client, key_hex)
            logger.info("Generated and stored new QKD key.")
            
            # 3. Log telemetry
            await record_event(db, "qkd_key_generated", {"key_id": key_hex[:16] + "..."})
            
            # 4. Release queued messages if any
            await release_queued_messages(redis_client, db, key_pool_service, crypto_engine, connection_manager)
            
        except asyncio.CancelledError:
            logger.info("QKD Daemon task cancelled.")
            break
        except Exception as e:
            logger.error(f"Error in QKD generation loop: {e}")
            
        await asyncio.sleep(settings.QKD_GENERATION_INTERVAL)

async def start_qkd_daemon():
    """Starts the QKD Daemon background task."""
    global _task
    if _task is None:
        _task = asyncio.create_task(_generate_key_loop())
        logger.info("QKD Daemon initialized.")

async def stop_qkd_daemon():
    """Stops the QKD Daemon background task."""
    global _task
    if _task is not None:
        _task.cancel()
        try:
            await _task
        except asyncio.CancelledError:
            pass
        _task = None
        logger.info("QKD Daemon stopped.")
