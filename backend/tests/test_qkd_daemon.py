import pytest
from unittest.mock import patch, AsyncMock
from app.services.key_pool_service import add_key

@pytest.mark.asyncio
async def test_key_generation(mock_db, mock_redis):
    # This tests the add_key function which is called by the daemon
    key_hex = "0" * 64
    inserted_id = await add_key(mock_db, mock_redis, key_hex)
    
    # Assert DB insert called
    mock_db["keys"].insert_one.assert_called_once()
    
    # Assert Redis sadd called
    mock_redis.sadd.assert_called_once_with("qkd:available_keys", key_hex)
    
    assert inserted_id == "test_id"
