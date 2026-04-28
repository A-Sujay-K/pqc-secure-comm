import pytest
import json
import time
from unittest.mock import AsyncMock, patch, MagicMock


@pytest.mark.asyncio
async def test_enqueue_message():
    """Messages should be added to the Redis sorted set with the correct score."""
    mock_redis = AsyncMock()
    mock_redis.zadd = AsyncMock(return_value=1)

    with patch("app.core.priority_queue.get_redis", return_value=mock_redis):
        from app.core.priority_queue import enqueue_message
        await enqueue_message("msg-001", {"content": "test"}, score=100.0)
        mock_redis.zadd.assert_called_once()
        args = mock_redis.zadd.call_args
        assert "msg-001" in args[0][1].keys().__iter__().__next__()  # message_id in entry JSON


@pytest.mark.asyncio
async def test_dequeue_returns_none_on_empty():
    """Dequeue on an empty queue should return None."""
    mock_redis = AsyncMock()
    mock_redis.zpopmin = AsyncMock(return_value=[])

    with patch("app.core.priority_queue.get_redis", return_value=mock_redis):
        from app.core.priority_queue import dequeue_oldest_message
        result = await dequeue_oldest_message()
        assert result is None


@pytest.mark.asyncio
async def test_get_queue_depth():
    """Queue depth should return the Redis zcard value."""
    mock_redis = AsyncMock()
    mock_redis.zcard = AsyncMock(return_value=7)

    with patch("app.core.priority_queue.get_redis", return_value=mock_redis):
        from app.core.priority_queue import get_queue_depth
        depth = await get_queue_depth()
        assert depth == 7
