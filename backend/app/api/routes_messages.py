from fastapi import APIRouter, Depends, Query
from app.services.message_service import get_message_history, get_unread_count
from app.api.routes_auth import get_current_user
from app.db.mongodb import get_database

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get("/history/{peer_id}")
async def fetch_history(
    peer_id: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    messages, total = await get_message_history(
        db=db,
        user_id=str(current_user["_id"]),
        peer_id=peer_id,
        page=page,
        per_page=per_page
    )
    return {
        "items": messages,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page
    }

@router.get("/unread")
async def fetch_unread(current_user: dict = Depends(get_current_user)):
    db = get_database()
    counts = await get_unread_count(db, str(current_user["_id"]))
    return counts
