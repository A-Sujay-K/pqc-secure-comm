from __future__ import annotations
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.mongodb import get_database
from app.models.message import COLLECTION as MESSAGES_COL
from app.schemas.message_schemas import MessageResponse
from datetime import datetime

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("/history/{peer_id}", response_model=List[MessageResponse])
async def get_message_history(
    peer_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Fetch paginated message history between the current user and a peer."""
    skip = (page - 1) * per_page

    # In a real implementation, current_user_id comes from JWT dependency
    # Using peer_id as both sides for simplicity in this demo
    query = {
        "$or": [
            {"sender_id": peer_id},
            {"recipient_id": peer_id},
        ]
    }

    cursor = (
        db[MESSAGES_COL]
        .find(query)
        .sort("created_at", -1)
        .skip(skip)
        .limit(per_page)
    )
    docs = await cursor.to_list(per_page)

    return [
        MessageResponse(
            id=doc["_id"],
            sender_id=doc["sender_id"],
            recipient_id=doc["recipient_id"],
            content=doc.get("content"),
            file_url=doc.get("file_url"),
            file_name=doc.get("file_name"),
            file_size=doc.get("file_size"),
            encryption_lane=doc["encryption_lane"],
            threat_score=doc["threat_score"],
            is_read=doc["is_read"],
            created_at=doc["created_at"],
        )
        for doc in docs
    ]
