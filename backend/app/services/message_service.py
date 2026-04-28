from __future__ import annotations
import base64
from app.core.routing_engine import determine_routing_lane
from app.core.priority_queue import enqueue_message, dequeue_oldest_message
from app.services.key_pool_service import get_available_key_count, pop_key
from app.services.crypto_service import encrypt_standard_lane, encrypt_critical_lane
from app.utils.sensitivity import get_sensitivity_score
from app.utils.constants import LANE_STANDARD, LANE_CRITICAL
from app.config import get_settings
from app.db.mongodb import get_database
from app.models.message import COLLECTION as MESSAGES_COL, create_message_doc
from loguru import logger


async def process_outgoing_message(
    sender_id: str,
    sender_priority: int,
    recipient_id: str,
    content: str,
    filename: str | None = None,
    high_security: bool = False,
) -> dict:
    """
    Process an outgoing message through the threat analyzer and route to the
    appropriate cryptographic lane.
    """
    settings = get_settings()

    # 1. Compute sensitivity score
    sensitivity = get_sensitivity_score(filename, high_security)

    # 2. Get current key pool depth
    available_keys = await get_available_key_count()

    # 3. Determine routing lane via Q_TL heuristic
    lane = await determine_routing_lane(
        sensitivity=sensitivity,
        sender_priority=sender_priority,
        available_keys=available_keys,
        settings=settings,
    )

    plaintext = content.encode("utf-8")

    if lane == LANE_STANDARD:
        # Simulate recipient public key for demo
        recipient_pub_key = b"\x00" * 1184  # Placeholder
        encrypted = encrypt_standard_lane(plaintext, recipient_pub_key)
    else:
        # Critical lane: use QKD key
        qkd_key = await pop_key()
        if qkd_key is None:
            # No key available - enqueue and send 'securing' status
            logger.warning("No QKD keys available. Buffering message in priority queue.")
            await enqueue_message(f"{sender_id}:{recipient_id}", {"content": content})
            return {"status": "queued", "message": "Securing connection, please wait..."}

        encrypted = encrypt_critical_lane(plaintext, qkd_key)

    # 4. Persist to MongoDB
    db = get_database()
    doc = create_message_doc(
        sender_id=sender_id,
        recipient_id=recipient_id,
        ciphertext_hex=encrypted["ciphertext"],
        signature_hex="sim_sig",
        encryption_lane=lane,
        threat_score=sensitivity,
        content=content,
    )
    await db[MESSAGES_COL].insert_one(doc)

    return {
        "status": "sent",
        "message_id": doc["_id"],
        "encryption_lane": lane,
        "threat_score": sensitivity,
    }
