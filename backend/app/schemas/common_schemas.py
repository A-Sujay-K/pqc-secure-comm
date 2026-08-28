from pydantic import BaseModel
from typing import Optional, List, Any
from enum import Enum

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    per_page: int
    pages: int

class StatusEnum(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    AWAY = "AWAY"
