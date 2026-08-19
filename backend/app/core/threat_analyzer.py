from loguru import logger
from app.config import Settings
from app.utils.constants import LANE_STANDARD, LANE_CRITICAL


async def compute_threat_level(
    sensitivity: float, sender_priority: int, available_keys: int = 0, settings: Settings = None
) -> float:
    """
    Computes the normalized security demand (Quantum Threat Level QTL in [0.0, 1.0])
    using the formal model:
    
    QTL(f) = w1 * S + w2 * I
    
    Where:
        S = sensitivity score (0.0 - 1.0)
        I = normalized sender priority (sender_priority / 10.0)
        w1 + w2 = 1.0
    """
    if settings is None:
        from app.config import get_settings
        settings = get_settings()
        
    S = max(0.0, min(1.0, sensitivity))
    I = max(0.0, min(1.0, sender_priority / 10.0))
    
    # Mathematical formulation: QTL(f) = w1 * S + w2 * I
    q_tl = (settings.W1 * S) + (settings.W2 * I)
    
    logger.debug(
        f"QTL computation: w1={settings.W1:.2f}, S={S:.2f}, w2={settings.W2:.2f}, "
        f"I={I:.2f} -> QTL={q_tl:.4f}"
    )
    return round(q_tl, 4)


def compute_dynamic_threshold(available_keys: int, settings: Settings) -> float:
    """
    Computes the effective switching threshold tau_eff based on key reservoir availability ratio:
    
    a(t) = A_K(t) / K_max
    tau_eff(a) = tau_min + (tau_max - tau_min) * (1 - a)
    """
    k_max = settings.K_MAX if settings.K_MAX > 0 else 20
    a = max(0.0, min(1.0, available_keys / k_max))
    tau_eff = settings.TAU_MIN + (settings.TAU_MAX - settings.TAU_MIN) * (1.0 - a)
    return round(tau_eff, 4)


def determine_lane(
    threat_score: float, 
    threshold: float, 
    sensitivity: float = 0.0, 
    s_crit: float = 0.85
) -> str:
    """
    Determines routing lane based on security demand, effective dynamic threshold,
    and critical sensitivity override:
    
    Route(f) = QKD if (QTL(f) >= tau_eff or S >= S_crit) else PQC
    """
    if threat_score >= threshold or sensitivity >= s_crit:
        return LANE_CRITICAL
    return LANE_STANDARD


async def analyze_payload(
    content: str | None,
    filename: str | None,
    high_security: bool,
    sender_priority: int,
    redis_client,
    settings: Settings,
    get_available_count_func,
) -> tuple[float, str, int, float]:
    """
    Orchestrates threat analysis to determine the appropriate encryption lane.
    
    Returns:
        (threat_score, lane, available_keys, dynamic_threshold)
    """
    from app.utils.sensitivity import get_sensitivity_score
    
    # 1. Compute sensitivity S in [0.0, 1.0]
    sensitivity = get_sensitivity_score(filename, content, high_security)
        
    # 2. Get available QKD keys A_K from pool
    available_keys = await get_available_count_func(redis_client)
    
    # 3. Compute security demand QTL(f) = w1*S + w2*I
    threat_score = await compute_threat_level(sensitivity, sender_priority, available_keys, settings)
    
    # 4. Compute dynamic threshold tau_eff(a)
    dynamic_threshold = compute_dynamic_threshold(available_keys, settings)
    
    # 5. Determine lane based on threshold and critical sensitivity override
    lane = determine_lane(threat_score, dynamic_threshold, sensitivity, settings.S_CRIT)
    
    logger.info(
        f"Threat analysis: S={sensitivity:.2f}, I={sender_priority/10.0:.2f}, "
        f"A_K={available_keys} -> QTL={threat_score:.4f}, tau_eff={dynamic_threshold:.4f} -> {lane.upper()}"
    )
    
    return threat_score, lane, available_keys, dynamic_threshold
