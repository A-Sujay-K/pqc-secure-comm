import pytest
from unittest.mock import AsyncMock, MagicMock
from app.config import Settings

@pytest.fixture
def mock_settings():
    return Settings(
        W1=1.0,
        W2=1.0,
        W3=1.0,
        THREAT_THRESHOLD=5.0,
        QKD_GENERATION_INTERVAL=10
    )

@pytest.fixture
def mock_redis():
    mock = AsyncMock()
    # Setup some defaults
    mock.sadd = AsyncMock(return_value=1)
    mock.spop = AsyncMock(return_value="0" * 64)
    mock.scard = AsyncMock(return_value=5)
    mock.zadd = AsyncMock()
    mock.zpopmin = AsyncMock(return_value=[('{"sender_id": "test"}', 10.0)])
    mock.zcard = AsyncMock(return_value=1)
    return mock

@pytest.fixture
def mock_db():
    db = MagicMock()
    
    # Mock collections
    collection = AsyncMock()
    collection.insert_one = AsyncMock(return_value=MagicMock(inserted_id="test_id"))
    collection.update_one = AsyncMock()
    collection.count_documents = AsyncMock(return_value=10)
    
    # Mock cursor for find/aggregate
    class AsyncCursor:
        def __init__(self, items):
            self.items = items
            
        def sort(self, *args, **kwargs):
            return self
            
        def skip(self, *args, **kwargs):
            return self
            
        def limit(self, *args, **kwargs):
            return self
            
        def __aiter__(self):
            self.iter = iter(self.items)
            return self
            
        async def __anext__(self):
            try:
                return next(self.iter)
            except StopIteration:
                raise StopAsyncIteration
                
    collection.find = MagicMock(return_value=AsyncCursor([{"_id": "1", "test": "data"}]))
    collection.aggregate = MagicMock(return_value=AsyncCursor([{"_id": "STANDARD", "count": 5}]))
    
    db.__getitem__.return_value = collection
    return db
