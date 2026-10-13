# Adaptive Hybrid Post-Quantum Secure Communication System

This is a production-grade hybrid post-quantum secure chat application. It features a User Chat Interface, a real-time Supervisor Telemetry Dashboard, and a dual-lane cryptographic backend.

## Prerequisites
1. **Node.js** (v18 or higher)
2. **Python** (3.11 or higher)
3. **Docker Desktop** (Make sure Docker is running)

## Setup Instructions

### 1. Start the Infrastructure (MongoDB & Redis)
Open a terminal in the root folder and run:
```bash
docker compose up -d
```
*This starts MongoDB on port 27018 and Redis on port 6380.*

### 2. Setup the Backend
Open a terminal in the `backend` folder and run:
```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Seed the Database with Demo Users
With your virtual environment still active, go back to the root folder and run:
```bash
python infra/scripts/seed_users.py
```
*This will create the accounts: `alice`, `bob`, `charlie`, `diana`, and `eve`. Password for all is `password123`.*

### 4. Start the Backend Server
In the `backend` folder, with the virtual environment active, run:
```bash
uvicorn app.main:app --reload
```
*The backend will now be running on http://localhost:8000*

### 5. Start the User Chat Frontend
Open a new terminal in the `frontend-user` folder and run:
```bash
npm install
npm run dev
```
*The chat app will be available at http://localhost:5173*

### 6. Start the Supervisor Dashboard
Open a new terminal in the `frontend-supervisor` folder and run:
```bash
npm install
npm run dev
```
*The dashboard will be available at http://localhost:5174*

## Testing the QKD Hybrid System
1. Open the Chat App and log in as `alice` (Password: `password123`).
2. Type normal messages, and you will see them encrypted via **Standard Lane (Kyber-768 / Dilithium)**.
3. Toggle the **High Security** button, OR type the word `"password"`, and you will see the system instantly route your message through the **Critical QKD Lane**, pulling a simulated quantum key from the live daemon!
4. Watch the Supervisor Dashboard to see the real-time routing metrics and QKD pool depths.
