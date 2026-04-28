from __future__ import annotations
import json
import time
from app.db.redis_client import get_redis
from app.utils.constants import PRIORITY_QUEUE_KEY
from loguru import logger


async def enqueue_message(message_id: str, payload: dict, score: float | None = None) -> None:
    """
    Add a pending message to the Redis priority queue (sorted set).
    Score defaults to the current Unix timestamp (FIFO within same priority).
    """
    redis = get_redis()
    entry_score = score if score is not None else time.time()
    entry = json.dumps({"message_id": message_id, "payload": payload})
    await redis.zadd(PRIORITY_QUEUE_KEY, {entry: entry_score})
    logger.info(f"Enqueued message {message_id} to priority queue (score={entry_score:.2f})")


async def dequeue_oldest_message() -> dict | None:
    """
    Pop the oldest pending message from the priority queue.
    Returns None if the queue is empty.
    """
    redis = get_redis()
    results = await redis.zpopmin(PRIORITY_QUEUE_KEY, 1)
    if not results:
        return None
    entry_str, score = results[0], results[1] if len(results) > 1 else 0
    return json.loads(entry_str)


async def get_queue_depth() -> int:
    """Return the number of messages currently waiting in the priority queue."""
    redis = get_redis()
    return await redis.zcard(PRIORITY_QUEUE_KEY)
