import json
import time
from loguru import logger
from app.utils.constants import PRIORITY_QUEUE_KEY
from app.config import get_settings

def compute_queue_score(qtl: float, arrival_time: float) -> float:
    """
    Computes priority score for Redis ZSET to enforce lexicographic min-heap order:
    pi(f) = (-QTL(f), t_arr(f))
    
    Higher QTL -> smaller score -> dequeued first.
    For equal QTL, earlier arrival time -> smaller score -> dequeued first (FIFO).
    """
    normalized_qtl = max(0.0, min(1.0, qtl))
    # Base offset from 2024 timestamp epoch to keep precision within IEEE 754 float
    t_offset = arrival_time - 1700000000.0
    return (1.0 - normalized_qtl) * 1e8 + t_offset

async def enqueue(redis_client, message_data: dict, priority: int = 5, qtl: float = 0.5) -> int:
    """
    Enqueues a message into the priority queue with deadline metadata.
    """
    arrival_time = time.time()
    message_data["arrival_time"] = arrival_time
    message_data["qtl"] = qtl
    message_data["sender_priority"] = priority
    
    score = compute_queue_score(qtl, arrival_time)
    message_str = json.dumps(message_data)
    
    await redis_client.zadd(PRIORITY_QUEUE_KEY, {message_str: score})
    position = await redis_client.zrank(PRIORITY_QUEUE_KEY, message_str)
    
    logger.debug(f"Enqueued message (QTL={qtl:.2f}) at position {position}. Score: {score:.4f}")
    return position if position is not None else 0

async def dequeue(redis_client) -> tuple[dict, float] | None:
    """
    Dequeues the highest priority message from the queue.
    Returns (message_data, score) or None.
    """
    result = await redis_client.zpopmin(PRIORITY_QUEUE_KEY)
    if not result:
        return None
        
    message_str, score = result[0]
    return json.loads(message_str), score

async def get_queue_depth(redis_client) -> int:
    """
    Returns the current number of messages in the queue.
    """
    return await redis_client.zcard(PRIORITY_QUEUE_KEY)

async def get_queue_entries(redis_client, limit: int = 10) -> list[dict]:
    """
    Returns the top N entries in the queue with their scores and wait times.
    """
    now = time.time()
    entries = await redis_client.zrange(PRIORITY_QUEUE_KEY, 0, limit - 1, withscores=True)
    res = []
    for msg_str, score in entries:
        msg = json.loads(msg_str)
        t_arr = msg.get("arrival_time", now)
        msg["wait_time"] = round(now - t_arr, 3)
        res.append({"message": msg, "score": score})
    return res

async def release_queued_messages(redis_client, db, key_pool_service, crypto_engine, connection_manager):
    """
    Algorithm 4 / Queue Release on Key Replenishment:
    Runs when keys are replenished. Iteratively inspects buffered messages,
    drops expired payloads exceeding DELIVERY_DEADLINE (5s), and dispatches
    valid messages using newly generated QKD keys.
    """
    settings = get_settings()
    deadline = settings.DELIVERY_DEADLINE
    
    while True:
        depth = await get_queue_depth(redis_client)
        if depth == 0:
            break
            
        available = await key_pool_service.get_available_count(redis_client)
        if available == 0:
            break
            
        pop_res = await dequeue(redis_client)
        if not pop_res:
            break
            
        message_data, score = pop_res
        now = time.time()
        arr_time = message_data.get("arrival_time", now)
        wait_time = now - arr_time
        
        # Check deadline expiry (Eq. 8)
        if wait_time > deadline:
            logger.warning(
                f"Delivery deadline exceeded ({wait_time:.2f}s > {deadline}s) "
                f"for message from {message_data.get('sender_id')}. Dropping as delivery failure."
            )
            # Log telemetry failure event
            from app.services.telemetry_service import record_event
            await record_event(db, "delivery_failure", {
                "sender_id": message_data.get("sender_id"),
                "recipient_id": message_data.get("receiver_id") or message_data.get("recipient_id"),
                "wait_time": wait_time,
                "reason": "deadline_timeout"
            })
            
            # Notify sender if connected
            sender_id = message_data.get("sender_id")
            if sender_id and connection_manager:
                await connection_manager.send_to_user(sender_id, {
                    "type": "delivery_failed",
                    "payload": {
                        "message": "Message delivery failed: QKD key wait time exceeded 5.0s deadline.",
                        "wait_time": wait_time
                    }
                })
            continue # Check next queued message
            
        # If not expired, allocate key and dispatch
        try:
            payload_dict = {"content": message_data.get("content")}
            if message_data.get("filename"):
                payload_dict["filename"] = message_data.get("filename")
            if message_data.get("file_data"):
                payload_dict["file_data"] = message_data.get("file_data")
                
            plaintext = json.dumps(payload_dict).encode('utf-8')
            
            qkd_key_hex = await key_pool_service.consume_key(db, redis_client)
            if not qkd_key_hex:
                # Key was snatched, re-queue
                logger.error("Failed to acquire key during release. Re-queuing.")
                await enqueue(
                    redis_client, 
                    message_data, 
                    priority=message_data.get("sender_priority", 5),
                    qtl=message_data.get("qtl", 0.5)
                )
                break
                
            # Hybrid Encryption (ML-KEM + QKD + ML-DSA)
            encrypted_payload = crypto_engine.encrypt_critical_lane(plaintext, qkd_key_hex)
            
            from app.models.message import create_message_doc
            from app.services.message_service import save_message
            
            recipient_id = message_data.get("receiver_id") or message_data.get("recipient_id")
            sender_id = message_data.get("sender_id")
            
            message_doc = create_message_doc(
                sender_id=sender_id,
                recipient_id=recipient_id,
                encryption_lane="critical",
                threat_score=message_data.get("threat_score", message_data.get("qtl", 0.8)),
                content=message_data.get("content"),
                file_name=message_data.get("filename"),
                ciphertext_hex=encrypted_payload.get("ciphertext", ""),
                signature_hex=encrypted_payload.get("signature", "")
            )
            
            msg_id = await save_message(db, message_doc)
            
            ws_msg = {
                "type": "chat_message",
                "payload": {
                    "id": msg_id,
                    "sender_id": sender_id,
                    "recipient_id": recipient_id,
                    "content": message_data.get("content"),
                    "file_name": message_data.get("filename"),
                    "file_url": None,
                    "file_size": None,
                    "encryption_lane": "critical",
                    "threat_score": message_data.get("threat_score", message_data.get("qtl", 0.8)),
                    "is_read": False,
                    "created_at": message_doc["created_at"].isoformat()
                }
            }
            
            if connection_manager:
                await connection_manager.send_to_user(recipient_id, ws_msg)
                await connection_manager.send_to_user(sender_id, ws_msg)
                await connection_manager.send_to_user(sender_id, {
                    "type": "delivery_confirmation",
                    "payload": {
                        "message_id": msg_id,
                        "status": "delivered_from_queue",
                        "encryption_lane": "critical",
                        "wait_time": wait_time
                    }
                })
                
            logger.info(f"Released and delivered queued message from {sender_id} after {wait_time:.2f}s wait.")
            
        except Exception as e:
            logger.error(f"Error processing queued message: {e}")
            await enqueue(
                redis_client, 
                message_data, 
                priority=message_data.get("sender_priority", 5),
                qtl=message_data.get("qtl", 0.5)
            )
            break
