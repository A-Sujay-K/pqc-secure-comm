# PQC Secure Comm — Adaptive Hybrid Post-Quantum Secure Communication System

A production-grade, real-time secure communication platform that intelligently routes
messages through either a Standard (PQC) or Critical (QKD) cryptographic lane based on
a dynamic threat-level heuristic.

## Architecture

- **Backend**: FastAPI + WebSockets + Motor (MongoDB) + Redis
- **Frontend User**: React (Vite) — end-user chat interface
- **Frontend Supervisor**: React (Vite) — live telemetry & system monitoring dashboard
- **Crypto**: Kyber-768 KEM + Dilithium-3 + AES-256-GCM (Standard); Simulated QKD (Critical)
- **Threat Analyzer**: `Q_TL = (w1*S + w2*I) / (w3*A_K)` determines routing lane

## Threat Level Heuristic

The routing decision is made by the Quantum Threat Level formula:

```
Q_TL = (w1 * S + w2 * I) / (w3 * A_K)

Where:
  S   = Message sensitivity score [0.0, 1.0] based on file type / content
  I   = Normalized sender priority (priority / 10)
  A_K = Available QKD keys in the key pool

Default weights: w1=0.4, w2=0.3, w3=0.3
Routing threshold: Q_TL >= 0.7 => Critical Lane; Q_TL < 0.7 => Standard Lane
```

If the key pool is empty (A_K = 0), the message is buffered in the Redis priority
queue until a new key is generated, and the sender receives a 'Securing connection...'
status update.

## Project Structure

```
pqc-secure-comm/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/      # REST routes
│   │   ├── core/     # Threat analyzer, routing engine, crypto engine
│   │   ├── db/       # MongoDB + Redis clients
│   │   ├── models/   # Document type definitions
│   │   ├── schemas/  # Pydantic request/response models
│   │   ├── services/ # QKD daemon, crypto, telemetry, file storage
│   │   └── ws/       # WebSocket endpoints
│   └── tests/
├── frontend-user/    # React chat client
├── frontend-supervisor/ # React supervisor dashboard
└── infra/            # Docker, Nginx, Redis, Mongo configs
```

## Quick Start

```bash
# 1. Start all infrastructure
docker-compose up --build

# 2. Or run backend locally
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload

# 3. Run frontend
cd frontend-user && npm install && npm run dev
```
