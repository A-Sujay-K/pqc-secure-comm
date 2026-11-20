import json
from loguru import logger
from app.core.threat_analyzer import analyze_payload
from app.core.crypto_engine import encrypt_standard_lane, encrypt_critical_lane
from app.services.key_pool_service import get_available_count, consume_key
from app.models.telemetry_event import create_telemetry_event
from app.services.telemetry_service import record_event
from app.utils.constants import LANE_STANDARD, LANE_CRITICAL
from app.config import get_settings

async def process_message(content: str, filename: str | None, file_data: bytes | None, high_security: bool, sender_id: str, sender_priority: int, redis_client, db) -> dict:
    """
    Orchestrates the full encryption pipeline and routing.
    """
    settings = get_settings()
    
    # Construct plaintext
    payload_dict = {"content": content}
    if filename:
        payload_dict["filename"] = filename
    if file_data:
        payload_dict["file_data"] = file_data.hex()
        
    plaintext = json.dumps(payload_dict).encode('utf-8')
    
    # Step 1: Analyze threat level and determine lane
    threat_score, lane, available_keys, dynamic_threshold = await analyze_payload(
        content, 
        filename, 
        high_security, 
        sender_priority, 
        redis_client, 
        settings, 
        get_available_count
    )
    
    from app.utils.sensitivity import get_sensitivity_score
    sensitivity = get_sensitivity_score(filename, content, high_security)
    
    k_max = settings.K_MAX if settings.K_MAX > 0 else 25
    a_t = round(max(0.0, min(1.0, available_keys / k_max)), 4)
    depletion_factor = round(1.0 - a_t, 4)
    priority_index = round(sender_priority / 10.0, 4) if sender_priority > 0 else 0.30
    
    qtl_details = {
        "formula_qtl": "QTL(f) = w1 * S + w2 * I",
        "w1": settings.W1,
        "S": round(sensitivity, 4),
        "w2": settings.W2,
        "I": priority_index,
        "sender_priority": sender_priority,
        "qtl": threat_score,
        "formula_tau": "tau_eff(a) = tau_min + (tau_max - tau_min) * (1 - a(t))",
        "tau_min": settings.TAU_MIN,
        "tau_max": settings.TAU_MAX,
        "tau_span": round(settings.TAU_MAX - settings.TAU_MIN, 4),
        "k_max": k_max,
        "available_keys": available_keys,
        "a_t": a_t,
        "depletion_factor": depletion_factor,
        "tau_eff": dynamic_threshold,
        "s_crit": settings.S_CRIT,
        "lane": lane
    }
    
    metadata = {
        "threat_score": threat_score,
        "lane": lane,
        "sender_id": sender_id,
        "available_keys_at_time": available_keys,
        "dynamic_threshold": dynamic_threshold,
        "sender_priority": sender_priority,
        "high_security_flag": high_security,
        "sensitivity": sensitivity,
        "qtl_details": qtl_details
    }
    
    # Step 2: Standard Lane processing
    if lane == LANE_STANDARD:
        logger.info(f"Routing message via STANDARD lane. Threat Score: {threat_score:.2f}")
        encrypted_payload = encrypt_standard_lane(plaintext)
        
        # Log telemetry
        await record_event(db, "routing_decision", metadata)
        
        return {
            "encrypted_payload": encrypted_payload,
            "lane": lane,
            "threat_score": threat_score,
            "queued": False,
            "metadata": metadata
        }
        
    # Step 3: Critical Lane processing (with available keys)
    elif lane == LANE_CRITICAL and available_keys > 0:
        logger.info(f"Routing message via CRITICAL lane. Threat Score: {threat_score:.2f}")
        qkd_key_hex = await consume_key(db, redis_client)
        
        if qkd_key_hex:
            encrypted_payload = encrypt_critical_lane(plaintext, qkd_key_hex)
            metadata["qkd_key_used"] = qkd_key_hex  # stored for lifecycle trace
            
            # Log telemetry
            await record_event(db, "routing_decision", metadata)
            
            return {
                "encrypted_payload": encrypted_payload,
                "lane": lane,
                "threat_score": threat_score,
                "queued": False,
                "metadata": metadata
            }
        else:
            # Race condition: key was consumed between check and fetch. Fall through to queueing.
            logger.warning("Critical lane selected but key was consumed concurrently. Queuing message.")
            
    # Step 4: Critical Lane queuing (no keys available)
    logger.info(f"CRITICAL lane selected but no keys available. Queuing message. Threat Score: {threat_score:.2f}")
    
    return {
        "encrypted_payload": None,
        "lane": lane,
        "threat_score": threat_score,
        "queued": True,
        "metadata": metadata
    }
