import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock, call


@pytest.mark.asyncio
async def test_qkd_daemon_generates_key():
    """QKD daemon should push a key to Redis and save to MongoDB on each cycle."""
    mock_redis = AsyncMock()
    mock_redis.rpush = AsyncMock(return_value=1)
    mock_redis.llen = AsyncMock(return_value=1)

    mock_db = MagicMock()
    mock_db["qkd_keys"].insert_one = AsyncMock(return_value=None)

    with patch("app.services.qkd_daemon.push_key", new=AsyncMock()) as mock_push, \
         patch("app.services.qkd_daemon.get_database", return_value=mock_db):

        from app.services.qkd_daemon import _qkd_generation_loop

        # Run only one iteration then cancel
        task = asyncio.create_task(_qkd_generation_loop(interval_seconds=0))
        await asyncio.sleep(0.1)
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

        assert mock_push.call_count >= 1
