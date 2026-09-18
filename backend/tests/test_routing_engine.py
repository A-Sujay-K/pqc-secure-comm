import pytest
from unittest.mock import patch, AsyncMock
from app.core.routing_engine import process_message
from app.utils.constants import LANE_STANDARD, LANE_CRITICAL

@pytest.mark.asyncio
@patch("app.core.routing_engine.analyze_payload")
@patch("app.core.routing_engine.encrypt_standard_lane")
@patch("app.core.routing_engine.encrypt_critical_lane")
@patch("app.core.routing_engine.record_event")
@patch("app.core.routing_engine.consume_key")
async def test_process_message_standard(
    mock_consume_key,
    mock_record_event, 
    mock_encrypt_critical, 
    mock_encrypt_standard, 
    mock_analyze, 
    mock_redis, 
    mock_db
):
    mock_analyze.return_value = (0.2, LANE_STANDARD, 10, 0.40)
    mock_encrypt_standard.return_value = {"ciphertext": "test"}
    
    result = await process_message(
        content="test", 
        filename=None, 
        file_data=None, 
        high_security=False, 
        sender_id="user1", 
        sender_priority=5, 
        redis_client=mock_redis, 
        db=mock_db
    )
    
    assert result["lane"] == LANE_STANDARD
    assert result["queued"] is False
    assert result["encrypted_payload"] == {"ciphertext": "test"}
    mock_encrypt_standard.assert_called_once()
    mock_record_event.assert_called_once()

@pytest.mark.asyncio
@patch("app.core.routing_engine.analyze_payload")
@patch("app.core.routing_engine.encrypt_standard_lane")
@patch("app.core.routing_engine.encrypt_critical_lane")
@patch("app.core.routing_engine.record_event")
@patch("app.core.routing_engine.consume_key")
async def test_process_message_critical_with_keys(
    mock_consume_key,
    mock_record_event, 
    mock_encrypt_critical, 
    mock_encrypt_standard, 
    mock_analyze, 
    mock_redis, 
    mock_db
):
    mock_analyze.return_value = (0.85, LANE_CRITICAL, 1, 0.60)
    mock_consume_key.return_value = "0" * 64
    mock_encrypt_critical.return_value = {"ciphertext": "test_critical"}
    
    result = await process_message(
        content="test", 
        filename=None, 
        file_data=None, 
        high_security=False, 
        sender_id="user1", 
        sender_priority=5, 
        redis_client=mock_redis, 
        db=mock_db
    )
    
    assert result["lane"] == LANE_CRITICAL
    assert result["queued"] is False
    assert result["encrypted_payload"] == {"ciphertext": "test_critical"}
    mock_encrypt_critical.assert_called_once()

@pytest.mark.asyncio
@patch("app.core.routing_engine.analyze_payload")
async def test_process_message_critical_queued(
    mock_analyze, 
    mock_redis, 
    mock_db
):
    mock_analyze.return_value = (0.90, LANE_CRITICAL, 0, 0.80)
    
    result = await process_message(
        content="test", 
        filename=None, 
        file_data=None, 
        high_security=False, 
        sender_id="user1", 
        sender_priority=5, 
        redis_client=mock_redis, 
        db=mock_db
    )
    
    assert result["lane"] == LANE_CRITICAL
    assert result["queued"] is True
    assert result["encrypted_payload"] is None
