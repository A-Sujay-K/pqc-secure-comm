import pytest
import math
from unittest.mock import AsyncMock, patch, MagicMock


@pytest.mark.asyncio
async def test_route_to_standard():
    """Low threat should route to standard lane."""
    from app.core.routing_engine import determine_routing_lane

    settings = MagicMock()
    settings.W1 = 0.4
    settings.W2 = 0.3
    settings.W3 = 0.3
    settings.THREAT_THRESHOLD = 0.7

    # Q_TL = (0.4*0.1 + 0.3*0.2) / (0.3*10) = (0.04+0.06)/3 = 0.033 < 0.7 => standard
    result = await determine_routing_lane(
        sensitivity=0.1,
        sender_priority=2,
        available_keys=10,
        settings=settings,
    )
    assert result == "standard"


@pytest.mark.asyncio
async def test_route_to_critical_high_threat():
    """High threat should route to critical lane."""
    from app.core.routing_engine import determine_routing_lane

    settings = MagicMock()
    settings.W1 = 0.4
    settings.W2 = 0.3
    settings.W3 = 0.3
    settings.THREAT_THRESHOLD = 0.7

    result = await determine_routing_lane(
        sensitivity=0.9,
        sender_priority=9,
        available_keys=2,
        settings=settings,
    )
    assert result == "critical"


@pytest.mark.asyncio
async def test_route_to_critical_no_keys():
    """Zero available keys always routes to critical lane."""
    from app.core.routing_engine import determine_routing_lane

    settings = MagicMock()
    settings.W1 = 0.4
    settings.W2 = 0.3
    settings.W3 = 0.3
    settings.THREAT_THRESHOLD = 0.7

    result = await determine_routing_lane(
        sensitivity=0.1,
        sender_priority=1,
        available_keys=0,
        settings=settings,
    )
    assert result == "critical"
