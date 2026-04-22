from __future__ import annotations
import math
from app.core.threat_analyzer import compute_threat_level
from app.utils.constants import LANE_STANDARD, LANE_CRITICAL
from app.config import Settings
from loguru import logger


async def determine_routing_lane(
    sensitivity: float,
    sender_priority: int,
    available_keys: int,
    settings: Settings,
) -> str:
    """
    Determine which cryptographic lane to use based on the threat level.

    Returns:
      LANE_STANDARD or LANE_CRITICAL
    """
    Q_TL = await compute_threat_level(
        sensitivity=sensitivity,
        sender_priority=sender_priority,
        available_keys=available_keys,
        settings=settings,
    )

    if math.isinf(Q_TL) or Q_TL >= settings.THREAT_THRESHOLD:
        logger.info(f"Routing to CRITICAL lane (Q_TL={Q_TL:.4f}, threshold={settings.THREAT_THRESHOLD})")
        return LANE_CRITICAL

    logger.debug(f"Routing to STANDARD lane (Q_TL={Q_TL:.4f})")
    return LANE_STANDARD
