from __future__ import annotations
import math
from app.config import Settings
from loguru import logger


async def compute_threat_level(
    sensitivity: float,
    sender_priority: int,
    available_keys: int,
    settings: Settings,
) -> float:
    """
    Compute the Quantum Threat Level for a message.

    Formula: Q_TL = (w1 * S + w2 * I) / (w3 * A_K)

    Where:
      S   = sensitivity score [0.0, 1.0]
      I   = normalized sender priority (sender_priority / 10)
      A_K = available QKD keys in pool

    Returns:
      float (0.0 to +inf). If A_K == 0, returns +inf to force critical routing.
    """
    S = max(0.0, min(sensitivity, 1.0))
    I = sender_priority / 10.0
    A_K = available_keys

    numerator = settings.W1 * S + settings.W2 * I
    denominator = settings.W3 * A_K

    if denominator == 0:
        logger.debug("A_K=0: routing to critical lane (no keys available)")
        return math.inf

    Q_TL = numerator / denominator
    logger.debug(f"Q_TL={Q_TL:.4f} (S={S}, I={I:.2f}, A_K={A_K})")
    return Q_TL
