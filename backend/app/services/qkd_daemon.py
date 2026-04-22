from __future__ import annotations
import asyncio
import secrets
from app.services.key_pool_service import push_key
from app.db.mongodb import get_database
from app.models.key_entry import COLLECTION as KEYS_COL, create_key_doc
from loguru import logger

_daemon_task: asyncio.Task | None = None


async def _qkd_generation_loop(interval_seconds: int) -> None:
    """Background loop that generates one 256-bit QKD key every `interval_seconds`."""
    logger.info(f"QKD Daemon started (interval={interval_seconds}s)")
    while True:
        try:
            # Generate a new 256-bit key
            key_hex = secrets.token_hex(32)

            # Push to Redis pool
            await push_key(key_hex)

            # Persist to MongoDB for auditability
            db = get_database()
            doc = create_key_doc()
            doc["key_hex"] = key_hex
            await db[KEYS_COL].insert_one(doc)

            logger.debug(f"QKD Daemon generated new key: {key_hex[:8]}...")
        except asyncio.CancelledError:
            logger.info("QKD Daemon received cancellation signal")
            raise
        except Exception as e:
            logger.error(f"QKD Daemon error: {e}")

        await asyncio.sleep(interval_seconds)


async def start_qkd_daemon(interval_seconds: int = 10) -> None:
    """Start the QKD key generation daemon as a background task."""
    global _daemon_task
    _daemon_task = asyncio.create_task(_qkd_generation_loop(interval_seconds))
    logger.info("QKD Daemon task created")


async def stop_qkd_daemon() -> None:
    """Stop the QKD daemon gracefully."""
    global _daemon_task
    if _daemon_task and not _daemon_task.done():
        _daemon_task.cancel()
        try:
            await _daemon_task
        except asyncio.CancelledError:
            pass
    logger.info("QKD Daemon stopped")
