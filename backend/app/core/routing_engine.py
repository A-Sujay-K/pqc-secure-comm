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
    
    metadata = {
        "threat_score": threat_score,
        "lane": lane,
        "available_keys_at_time": available_keys,
        "dynamic_threshold": dynamic_threshold,
        "sender_priority": sender_priority,
        "high_security_flag": high_security
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
