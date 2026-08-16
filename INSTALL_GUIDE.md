# PQC Secure Comm — Installation & Deployment Guide

## Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose v2
- MongoDB 6+
- Redis 7+
- liboqs (optional — falls back to simulated PQC if not installed)

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/A-Sujay-K/pqc-secure-comm.git
cd pqc-secure-comm
```

### 2. Backend Configuration
```bash
cd backend
cp .env.example .env
# Required settings to update:
# - JWT_SECRET (use a strong random value)
# - MONGODB_URI (if using external MongoDB)
# - REDIS_URI (if using external Redis)
pip install -r requirements.txt
```

### 3. Docker Deployment (Recommended)
```bash
# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f backend
```

### 4. Local Development
```bash
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload --port 8000

# Terminal 2: User frontend
cd frontend-user && npm install && npm run dev

# Terminal 3: Supervisor frontend
cd frontend-supervisor && npm install && npm run dev
```

## Service URLs
| Service            | URL                   |
|--------------------|-----------------------|
| API                | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Chat App           | http://localhost:5173 |
| Supervisor         | http://localhost:5174 |

## Running Tests
```bash
cd backend
pytest tests/ -v --asyncio-mode=auto
```

## Architecture Notes

### Threat Level Routing
Every outgoing message is evaluated by the `Q_TL` heuristic:
```
Q_TL = (w1 * S + w2 * I) / (w3 * A_K)
```
- If `Q_TL >= 0.7`: routed to **Critical Lane** (QKD key + AES-256-GCM)
- If `Q_TL < 0.7`: routed to **Standard Lane** (Kyber-768 + Dilithium-3 + AES-256-GCM)
- If `A_K == 0`: buffered in Redis priority queue, client notified with 'Securing connection...'

### QKD Daemon
A background asyncio task generates one simulated 256-bit key every 10 seconds,
storing it in Redis (for fast access) and MongoDB (for auditability).
