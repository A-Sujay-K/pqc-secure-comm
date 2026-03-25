from __future__ import annotations
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import logging

from app.config import get_settings
from app.db.mongodb import init_mongodb, close_mongodb
from app.db.redis_client import init_redis, close_redis

# Routers
from app.api.routes_auth import router as auth_router
from app.api.routes_health import router as health_router
from app.api.routes_messages import router as messages_router
from app.api.routes_telemetry import router as telemetry_router


class _InterceptHandler(logging.Handler):
    def emit(self, record: logging.LogRecord) -> None:
        logger.opt(depth=6, exception=record.exc_info).log(record.levelname, record.getMessage())


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logging.basicConfig(handlers=[_InterceptHandler()], level=0, force=True)
    logger.info("PQC Secure Comm API starting up...")

    await init_mongodb(settings.MONGODB_URI, settings.MONGODB_DB_NAME)
    await init_redis(settings.REDIS_URI)

    logger.info("All services initialized. Ready to serve requests.")
    yield

    await close_mongodb()
    await close_redis()
    logger.info("PQC Secure Comm API shut down cleanly.")


settings = get_settings()

app = FastAPI(title="PQC Secure Comm API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1")
app.include_router(messages_router, prefix="/api/v1")
app.include_router(telemetry_router, prefix="/api/v1")
