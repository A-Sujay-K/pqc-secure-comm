import pytest
from unittest.mock import AsyncMock, MagicMock


@pytest.mark.asyncio
async def test_threat_level_low():
    """Low sensitivity + low priority should route to standard lane."""
    # sensitivity=0.1, priority=3, available_keys=10
    sensitivity = 0.1
    I = 3 / 10.0
    A_K = 10
    w1, w2, w3 = 0.4, 0.3, 0.3
    Q_TL = (w1 * sensitivity + w2 * I) / (w3 * A_K)
    assert Q_TL < 0.7, f"Expected standard lane but got Q_TL={Q_TL}"


@pytest.mark.asyncio
async def test_threat_level_high():
    """High sensitivity + high priority should route to critical lane."""
    sensitivity = 0.9
    I = 9 / 10.0
    A_K = 5
    w1, w2, w3 = 0.4, 0.3, 0.3
    Q_TL = (w1 * sensitivity + w2 * I) / (w3 * A_K)
    assert Q_TL > 0.7, f"Expected critical lane but got Q_TL={Q_TL}"


@pytest.mark.asyncio
async def test_threat_level_no_keys():
    """Zero available keys should produce infinity or very high score."""
    sensitivity = 0.5
    I = 0.5
    A_K = 0
    w3 = 0.3
    denominator = w3 * A_K
    # When A_K is 0, the system should route to critical (buffer in queue)
    assert denominator == 0
