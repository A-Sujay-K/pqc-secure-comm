from __future__ import annotations
from enum import Enum
from typing import List, TypeVar, Generic
from pydantic import BaseModel

T = TypeVar("T")


class ErrorResponse(BaseModel):
    detail: str
    error_code: str | None = None


class StatusEnum(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    AWAY = "away"


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    per_page: int
    pages: int

    @classmethod
    def create(cls, items: List[T], total: int, page: int, per_page: int):
        pages = (total + per_page - 1) // per_page
        return cls(items=items, total=total, page=page, per_page=per_page, pages=pages)
