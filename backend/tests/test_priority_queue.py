import pytest
import json
from app.core.priority_queue import enqueue, dequeue, get_queue_depth, compute_queue_score
from app.utils.constants import PRIORITY_QUEUE_KEY

def test_compute_queue_score():
    # Higher QTL must yield lower score (to pop first from min-heap)
    score_high = compute_queue_score(qtl=0.90, arrival_time=1700000100.0)
    score_low = compute_queue_score(qtl=0.40, arrival_time=1700000100.0)
    assert score_high < score_low

    # Equal QTL: earlier arrival time must yield lower score (FIFO for ties)
    score_early = compute_queue_score(qtl=0.80, arrival_time=1700000100.0)
    score_late = compute_queue_score(qtl=0.80, arrival_time=1700000200.0)
    assert score_early < score_late

@pytest.mark.asyncio
async def test_enqueue(mock_redis):
    mock_redis.zrank.return_value = 0
    position = await enqueue(mock_redis, {"id": 1}, priority=5, qtl=0.7)
    assert position == 0
    mock_redis.zadd.assert_called_once()

@pytest.mark.asyncio
async def test_dequeue(mock_redis):
    msg_data = {"id": 1, "test": "data"}
    mock_redis.zpopmin.return_value = [(json.dumps(msg_data), 10.5)]
    
    result = await dequeue(mock_redis)
    assert result is not None
    data, score = result
    assert data == msg_data
    assert score == 10.5
    mock_redis.zpopmin.assert_called_once()

@pytest.mark.asyncio
async def test_dequeue_empty(mock_redis):
    mock_redis.zpopmin.return_value = []
    result = await dequeue(mock_redis)
    assert result is None

@pytest.mark.asyncio
async def test_queue_depth(mock_redis):
    mock_redis.zcard.return_value = 42
    depth = await get_queue_depth(mock_redis)
    assert depth == 42
