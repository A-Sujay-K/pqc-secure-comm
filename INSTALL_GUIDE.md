# Installation Guide

## Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- MongoDB 6+
- Redis 7+

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/A-Sujay-K/pqc-secure-comm.git
cd pqc-secure-comm
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend-user
npm install
npm run dev
```

### 4. Docker Compose (All Services)
```bash
docker-compose up --build
```
