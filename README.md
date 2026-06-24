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

## API Endpoints

### Authentication
```
POST /api/v1/auth/register   — Register new user
POST /api/v1/auth/login      — Login and get JWT token
```

### Telemetry
```
GET /api/v1/telemetry/snapshot  — Get real-time system snapshot
WS  /ws/telemetry               — Live telemetry WebSocket feed
```

### Chat
```
WS  /ws/chat?token=<jwt>        — Authenticated chat WebSocket
```

### Health
```
GET /api/v1/health              — Health check for MongoDB + Redis
```

## Threat Level Heuristic

```
Q_TL = (w1 * S + w2 * I) / (w3 * A_K)

S   = Sensitivity [0.0, 1.0]   — based on file type and high_security flag
I   = Normalized priority       — sender_priority / 10
A_K = Available QKD keys

Q_TL >= 0.7  =>  Critical Lane (QKD + AES-256-GCM)
Q_TL <  0.7  =>  Standard Lane (Kyber-768 + Dilithium-3 + AES-256-GCM)
A_K  == 0    =>  Buffer in Redis priority queue, send 'Securing connection...'
```

## Quick Start

```bash
git clone https://github.com/A-Sujay-K/pqc-secure-comm.git
cd pqc-secure-comm
docker-compose up --build
```

Access:
- **Chat App**: http://localhost:5173
- **Supervisor Dashboard**: http://localhost:5174
- **API Docs**: http://localhost:8000/docs
