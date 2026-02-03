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

## Project Structure

```
pqc-secure-comm/
├── backend/          # FastAPI backend
├── frontend-user/    # Chat client
├── frontend-supervisor/ # Supervisor dashboard
└── infra/            # Docker, Nginx, Redis, Mongo configs
```
