import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.fixture(scope="session")
def event_loop():
    """Create a session-scoped event loop."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_db():
    """Mock MongoDB database instance."""
    db = MagicMock()
    db["users"].create_index = AsyncMock(return_value=None)
    db["messages"].create_index = AsyncMock(return_value=None)
    db["qkd_keys"].create_index = AsyncMock(return_value=None)
    return db


@pytest.fixture
def mock_redis():
    """Mock Redis instance."""
    r = AsyncMock()
    r.ping = AsyncMock(return_value=True)
    r.get = AsyncMock(return_value=None)
    r.set = AsyncMock(return_value=True)
    r.lpush = AsyncMock(return_value=1)
    r.lrange = AsyncMock(return_value=[])
    return r
