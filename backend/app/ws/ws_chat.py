from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from loguru import logger
import json
from datetime import datetime, timezone
from app.ws.connection_manager import manager
from app.utils.security import decode_jwt_token
from app.db.mongodb import get_database
from app.db.redis_client import get_redis
from app.services.user_service import set_online_status, get_user_by_id
from app.core.routing_engine import process_message
from app.core.priority_queue import enqueue
from app.core.crypto_engine import execute_full_crypto_lifecycle
from app.models.message import create_message_doc
from app.services.message_service import save_message, mark_as_read
from app.services.telemetry_service import record_event
from app.utils.constants import LANE_CRITICAL, LANE_STANDARD

router = APIRouter()

@router.websocket("/ws/chat/{token}")
async def websocket_chat_endpoint(websocket: WebSocket, token: str):
    db = get_database()
    redis_client = get_redis()
    
    # 1. Validate JWT
    payload = decode_jwt_token(token)
    if not payload or "sub" not in payload:
        await websocket.close(code=1008, reason="Invalid token")
        return
        
    user_id = payload["sub"]
    
    # Fetch user doc for priority
    user_doc = await get_user_by_id(db, user_id)
    sender_priority = user_doc.get("priority", 5) if user_doc else 5
    
    # 2. Connect
    await manager.connect_user(user_id, websocket)
    await set_online_status(db, redis_client, user_id, True)
    
    # Broadcast online status to all connected users
    await manager.broadcast_user_status(user_id, True)
    
    try:
        while True:
            # 3. Main receive loop
            data = await websocket.receive_text()
            try:
                msg_data = json.loads(data)
                msg_type = msg_data.get("type")
                
                if msg_type == "chat_message":
                    content = msg_data.get("content")
                    filename = msg_data.get("file_name")
                    file_data_b64 = msg_data.get("file_data")
                    high_security = msg_data.get("high_security", False)
                    recipient_id = msg_data.get("recipient_id")
                    
                    if not recipient_id:
                        continue
                    
                    # Convert base64 file data to bytes if present
                    file_data = None
                    if file_data_b64:
                        import base64
                        file_data = base64.b64decode(file_data_b64)
                        
                        # Input handling: enforce maximum file upload limit (25MB default)
                        from app.config import get_settings
                        settings_cfg = get_settings()
                        max_bytes = settings_cfg.MAX_FILE_SIZE_MB * 1024 * 1024
                        if len(file_data) > max_bytes:
                            await manager.send_to_user(user_id, {
                                "type": "error",
                                "payload": {"message": f"File exceeds maximum allowed size of {settings_cfg.MAX_FILE_SIZE_MB}MB"}
                            })
                            continue
                        
                    # Store file if present
                    file_url = None
                    file_size = None
                    if file_data and filename:
                        from app.services.file_storage import save_file
                        try:
                            file_url = save_file(file_data, filename)
                            file_size = len(file_data)
                        except ValueError as path_err:
                            logger.warning(f"File upload rejected for path anomaly: {path_err}")
                            continue
                        
                    # Process and route through threat analyzer + crypto engine
                    routing_result = await process_message(
                        content=content or "",
                        filename=filename,
                        file_data=file_data,
                        high_security=high_security,
                        sender_id=user_id,
                        sender_priority=sender_priority,
                        redis_client=redis_client,
                        db=db
                    )
                    
                    if routing_result["queued"]:
                        # Enqueue into Redis priority queue for later delivery
                        queue_position = await enqueue(
                            redis_client, {
                                "sender_id": user_id,
                                "receiver_id": recipient_id,
                                "content": content,
                                "filename": filename,
                                "file_data": file_data_b64,
                                "high_security": high_security,
                                "sender_priority": sender_priority,
                                "lane": routing_result["lane"],
                                "threat_score": routing_result["threat_score"],
                            }, 
                            priority=sender_priority,
                            qtl=routing_result["threat_score"]
                        )
                        
                        # Send security banner to sender
                        await manager.send_to_user(user_id, {
                            "type": "security_banner",
                            "payload": {
                                "message": "Securing connection... waiting for quantum key generation.",
                                "queue_position": queue_position + 1,
                            }
                        })
                        
                        # Log telemetry
                        await record_event(db, "message_queued", {
                            "sender_id": user_id,
                            "recipient_id": recipient_id,
                            "threat_score": routing_result["threat_score"],
                            "queue_position": queue_position,
                        })
                    else:
                        # Build and save the message document
                        encrypted = routing_result["encrypted_payload"]
                        message_doc = create_message_doc(
                            sender_id=user_id,
                            recipient_id=recipient_id,
                            encryption_lane=routing_result["lane"],
                            threat_score=routing_result["threat_score"],
                            content=content,
                            file_name=filename,
                            file_url=file_url,
                            file_size=file_size,
                            ciphertext_hex=encrypted.get("ciphertext", ""),
                            signature_hex=encrypted.get("signature", ""),
                        )
                        
                        msg_id = await save_message(db, message_doc)
                        
                        # Run full crypto lifecycle to get detailed timings & key trace
                        try:
                            plaintext_for_trace = json.dumps({"content": content or ""}).encode()
                            qkd_key_used = routing_result["metadata"].get("qkd_key_used")
                            lifecycle = execute_full_crypto_lifecycle(
                                plaintext_bytes=plaintext_for_trace,
                                lane=routing_result["lane"],
                                qkd_key_hex=qkd_key_used,
                            )
                        except Exception as crypto_err:
                            logger.warning(f"Crypto lifecycle trace failed: {crypto_err}")
                            lifecycle = {}
                        
                        # Log detailed message encryption telemetry
                        await record_event(db, "message_encrypted", {
                            "message_id": msg_id,
                            "sender_id": user_id,
                            "recipient_id": recipient_id,
                            "content_preview": (content[:50] + '...') if content and len(content) > 50 else content,
                            "file_name": filename,
                            "encryption_lane": routing_result["lane"],
                            "threat_score": routing_result["threat_score"],
                            "high_security": high_security,
                            # Raw encryption fields
                            "ciphertext_preview": encrypted.get("ciphertext", "")[:64] + "...",
                            "signature_preview": encrypted.get("signature", "")[:64] + "...",
                            "nonce": encrypted.get("nonce", ""),
                            "tag": encrypted.get("tag", ""),
                            "kem_used": "ML-KEM-768",
                            "sig_used": "ML-DSA-65",
                            "aes_mode": "AES-256-GCM",
                            # Full lifecycle (timings, keys, sizes, verification)
                            "lifecycle": lifecycle,
                            # QTL formulation and dynamic threshold parameters
                            "qtl_details": routing_result.get("metadata", {}).get("qtl_details"),
                            "available_keys_at_time": routing_result.get("metadata", {}).get("available_keys_at_time"),
                            "dynamic_threshold": routing_result.get("metadata", {}).get("dynamic_threshold"),
                            "sender_priority": sender_priority,
                            "sensitivity": routing_result.get("metadata", {}).get("sensitivity"),
                        })
                        
                        # Check contact status for recipient
                        is_contact_for_recipient = await db["contacts"].find_one({
                            "user_id": recipient_id,
                            "contact_id": user_id
                        }) is not None

                        # Deliver to recipient
                        created_at_dt = message_doc.get("created_at")
                        if isinstance(created_at_dt, datetime):
                            if created_at_dt.tzinfo is None:
                                created_at_dt = created_at_dt.replace(tzinfo=timezone.utc)
                            created_at_iso = created_at_dt.isoformat()
                        elif isinstance(created_at_dt, str):
                            created_at_iso = created_at_dt if (created_at_dt.endswith("Z") or "+" in created_at_dt) else f"{created_at_dt}Z"
                        else:
                            created_at_iso = datetime.now(timezone.utc).isoformat()

                        recipient_payload = {
                            "type": "chat_message",
                            "payload": {
                                "id": msg_id,
                                "sender_id": user_id,
                                "recipient_id": recipient_id,
                                "content": content,
                                "file_name": filename,
                                "file_url": file_url,
                                "file_size": file_size,
                                "encryption_lane": routing_result["lane"],
                                "threat_score": routing_result["threat_score"],
                                "is_read": False,
                                "is_contact": is_contact_for_recipient,
                                "created_at": created_at_iso,
                            }
                        }
                        await manager.send_to_user(recipient_id, recipient_payload)
                        
                        # Deliver to sender so they see it in their UI
                        sender_payload = {
                            "type": "chat_message",
                            "payload": {
                                "id": msg_id,
                                "sender_id": user_id,
                                "recipient_id": recipient_id,
                                "content": content,
                                "file_name": filename,
                                "file_url": file_url,
                                "file_size": file_size,
                                "encryption_lane": routing_result["lane"],
                                "threat_score": routing_result["threat_score"],
                                "is_read": False,
                                "is_contact": True,
                                "created_at": created_at_iso,
                            }
                        }
                        await manager.send_to_user(user_id, sender_payload)
                        
                        # Also send delivery confirmation to sender
                        await manager.send_to_user(user_id, {
                            "type": "delivery_confirmation",
                            "payload": {
                                "message_id": msg_id,
                                "status": "delivered",
                                "encryption_lane": routing_result["lane"],
                                "threat_score": routing_result["threat_score"],
                            }
                        })
                        
                elif msg_type in ("typing_start", "typing_stop"):
                    recipient_id = msg_data.get("recipient_id")
                    if recipient_id:
                        await manager.send_to_user(recipient_id, {
                            "type": msg_type,
                            "payload": {"user_id": user_id}
                        })
                        
                elif msg_type == "read_receipt":
                    message_ids = msg_data.get("message_ids", [])
                    recipient_id = msg_data.get("recipient_id")
                    if message_ids:
                        await mark_as_read(db, message_ids)
                        if recipient_id:
                            await manager.send_to_user(recipient_id, {
                                "type": "read_receipt",
                                "payload": {
                                    "message_ids": message_ids,
                                    "reader_id": user_id,
                                }
                            })
                            
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON received from user {user_id}")
            except Exception as e:
                logger.error(f"Error processing message from {user_id}: {e}")
                
    except WebSocketDisconnect:
        logger.info(f"User {user_id} disconnected")
    finally:
        await manager.disconnect_user(user_id)
        await set_online_status(db, redis_client, user_id, False)
        await manager.broadcast_user_status(user_id, False)
