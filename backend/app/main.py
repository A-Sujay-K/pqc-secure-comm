from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from loguru import logger
import logging

from app.config import get_settings
from app.db.mongodb import init_mongodb, close_mongodb
from app.db.redis_client import init_redis, close_redis

# Optional imports for routes and daemon
try:
    from app.services.qkd_daemon import start_qkd_daemon, stop_qkd_daemon
except ImportError:
    start_qkd_daemon = None
    stop_qkd_daemon = None

try:
    from app.api.routes_auth import router as auth_router
except ImportError:
    auth_router = None

try:
    from app.api.routes_messages import router as messages_router
except ImportError:
    messages_router = None

try:
    from app.api.routes_telemetry import router as telemetry_router
except ImportError:
    telemetry_router = None

try:
    from app.api.routes_health import router as health_router
except ImportError:
    health_router = None

try:
    from app.ws.ws_chat import router as ws_chat_router
except ImportError:
    ws_chat_router = None

try:
    from app.ws.ws_telemetry import router as ws_telemetry_router
except ImportError:
    ws_telemetry_router = None


class InterceptHandler(logging.Handler):
    def emit(self, record):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())

@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    
    # Configure Loguru
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    logger.info("Starting PQC Secure Comm API...")
    
    # Init databases
    await init_mongodb(settings.MONGODB_URI, settings.MONGODB_DB_NAME)
    await init_redis(settings.REDIS_URI)
    
    # Start QKD Daemon if available
    if start_qkd_daemon:
        await start_qkd_daemon()
        
    yield
    
    logger.info("Shutting down PQC Secure Comm API...")
    if stop_qkd_daemon:
        await stop_qkd_daemon()
    await close_redis()
    await close_mongodb()

app = FastAPI(title="PQC Secure Comm API", version="1.0.0", lifespan=lifespan)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

if auth_router:
    app.include_router(auth_router, prefix="/api/v1")
if messages_router:
    app.include_router(messages_router, prefix="/api/v1")
if telemetry_router:
    app.include_router(telemetry_router, prefix="/api/v1")
if health_router:
    app.include_router(health_router, prefix="/api/v1")
if ws_chat_router:
    app.include_router(ws_chat_router)
if ws_telemetry_router:
    app.include_router(ws_telemetry_router)

# Static file serving for uploads
uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
