# Production Deployment Runbook — Adaptive Hybrid PQC Communication System

This runbook provides the exhaustive, field-by-field configuration specification for deploying the **Adaptive Hybrid Post-Quantum Secure Communication System** across 100% free-tier, enterprise-grade cloud platforms.

---

## 1. System Topology & Service Mapping

```mermaid
flowchart TD
    subgraph DataTier ["Cloud Storage Layer (Zero Cost)"]
        MDB[("MongoDB Atlas M0<br/>cluster0.tf6kl4m.mongodb.net<br/>Port 27017 / SRV")]
        RED[("Upstash Redis Serverless<br/>rediss://...<br/>Port 6379 / TLS")]
    end

    subgraph ComputeTier ["Compute & WebSocket Engine (Free Tier)"]
        REN["Render.com Web Service<br/>Python 3.11 / FastAPI / Uvicorn<br/>Dual-Lane Dispatcher & QKD Daemon"]
    end

    subgraph EdgeTier ["Global Edge & Client Delivery (Vercel Free Tier)"]
        V1["Vercel App 1: User Chat<br/>pqc-user-chat.vercel.app<br/>React + Tailwind + WebSockets"]
        V2["Vercel App 2: Supervisor Dashboard<br/>pqc-supervisor.vercel.app<br/>React + Recharts + Live Telemetry"]
    end

    REN -->|Persistent NoSQL| MDB
    REN -->|Priority Queue & Key Pool| RED
    V1 -->|REST HTTPS + WSS Chat| REN
    V2 -->|REST HTTPS + WSS Telemetry| REN
```

---

## 2. Phase 1: MongoDB Atlas (Database Tier)

### 2.1 Cluster Verification
* **Provider**: MongoDB Atlas (AWS Region `us-east-1` or `ap-south-1`)
* **Cluster Tier**: `M0 Sandbox` (Free 512 MB Storage)
* **Cluster Hostname**: `cluster0.tf6kl4m.mongodb.net`

### 2.2 Security & Access Parameters
Navigate to **Security ➔ Database Access**:
| Parameter Name | Field Label in Atlas UI | Required Value | Notes |
| :--- | :--- | :--- | :--- |
| `db_username` | **Username** | `pqc_prod_user` | Atlas database user |
| `db_password` | **Password** | `DVHt72lg2nCcnSuo` | Secure production password |
| `role` | **Database User Privileges** | `readWriteAnyDatabase` *(or `Read and write to any database`)* | Grants schema & index creation |

Navigate to **Security ➔ Network Access**:
| Parameter Name | Field Label in Atlas UI | Required Value | Notes |
| :--- | :--- | :--- | :--- |
| `ip_whitelist` | **IP Address** | `0.0.0.0/0` | Enables Render/Koyeb dynamic IP ingress |
| `comment` | **Comment** | `Allow All (Render Cloud Backend)` | Standard for serverless/PaaS backends |

### 2.3 Connection String
* **Parameter Name**: `MONGODB_URI`
* **Full Assembled Value**:
  ```text
  mongodb+srv://pqc_prod_user:DVHt72lg2nCcnSuo@cluster0.tf6kl4m.mongodb.net/pqc_secure_comm?retryWrites=true&w=majority
  ```

---

## 3. Phase 2: Upstash Redis (Cache & Priority Queue)

Upstash delivers serverless Redis over native TLS with zero credit card requirements and 10,000 commands/day on the free tier.

### 3.1 Database Creation Parameters
Navigate to **[console.upstash.com](https://console.upstash.com) ➔ Databases ➔ Create Database**:
| Parameter Name | Field Label in Upstash UI | Recommended Value | Notes |
| :--- | :--- | :--- | :--- |
| `name` | **Name** | `pqc-redis` | Identifier for the queue instance |
| `type` | **Type** | `Regional` | Lowest latency serverless model |
| `cloud` | **Primary Cloud Provider** | `AWS` | Matches MongoDB Atlas host |
| `region` | **Primary Region** | `us-east-1` *(or closest to backend)* | Colocate with Render backend |
| `eviction` | **Eviction** | `No eviction` | Prevents QKD keys from premature eviction |
| `tls` | **TLS (SSL)** | `Enabled` | Enforces encrypted socket (`rediss://`) |

### 3.2 Output Connection Parameters
Under **Details ➔ Connect to your database ➔ redis-cli / URL**:
| Parameter Name | Field Label | Value Format |
| :--- | :--- | :--- |
| `REDIS_URI` | **Redis URL** | `rediss://default:<UPSTASH_PASSWORD>@<UPSTASH_ENDPOINT>.upstash.io:6379` |

---

## 4. Phase 3: Render.com (Backend Web Service)

### 4.1 Deployment Setup Parameters
Navigate to **[dashboard.render.com](https://dashboard.render.com) ➔ New + ➔ Web Service**:
1. Connect GitHub repository: `A-Sujay-K/pqc-secure-comm`
2. Fill in the deployment form with the exact parameters below:

| Parameter Name | Form Label in Render UI | Exact Value | Purpose |
| :--- | :--- | :--- | :--- |
| `service_name` | **Name** | `pqc-secure-comm-backend` | Subdomain: `.onrender.com` |
| `region` | **Region** | `Oregon (US West)` *(or Frankfurt/Singapore)* | Geographical host location |
| `branch` | **Branch** | `main` | Git deployment branch |
| `root_dir` | **Root Directory** | *(leave blank)* | Builds from repository root |
| `runtime` | **Runtime** | `Python 3` | Python 3.11 managed environment |
| `build_command` | **Build Command** | `pip install -r backend/requirements.txt` | Installs FastAPI, Motor, Redis, Cryptography |
| `start_command` | **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend` | Launches ASGI server with dynamic port |
| `instance_type` | **Instance Type** | `Free` ($0/mo) | 512 MB RAM, 0.1 CPU, 750 free hours |
| `health_check` | **Health Check Path** | `/api/v1/health` | Uptime monitor / startup validation |
| `auto_deploy` | **Auto-Deploy** | `Yes` | Auto-deploys on `git push origin main` |

### 4.2 Backend Environment Variables Specification
Add the following key-value pairs under the **Environment Variables** tab:

| Variable Name | Required Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://pqc_prod_user:DVHt72lg2nCcnSuo@cluster0.tf6kl4m.mongodb.net/pqc_secure_comm?retryWrites=true&w=majority` | Connection to Atlas M0 cluster |
| `MONGODB_DB_NAME` | `pqc_secure_comm` | Database name for collections |
| `REDIS_URI` | `rediss://default:gQAAAAAAAzOOAAIgcDJkNGViOTI3NTVjNmY0NjdhYWI3N2QzYjkyMGY2OTUyNw@special-sunbird-209806.upstash.io:6379` | TLS Upstash connection string |
| `JWT_SECRET` | `pqc_prod_sec_789f2a938c1b489d27a19c540938f` | 32-byte production HMAC secret |
| `JWT_ALGORITHM` | `HS256` | Cryptographic JWT signing algorithm |
| `JWT_EXPIRY_MINUTES` | `60` | Token lifetime |
| `QKD_GENERATION_INTERVAL` | `12` | Quantum daemon interval in seconds |
| `THREAT_THRESHOLD` | `0.8` | Heuristic gate boundary ($Q_{TL} \ge 0.8 \rightarrow \text{Critical}$) |
| `W1` | `0.6` | Sensitivity weight ($w_1$) in $Q_{TL}$ formula |
| `W2` | `0.4` | Priority weight ($w_2$) in $Q_{TL}$ formula |
| `W3` | `0.0` | Backward compatibility coefficient |
| `K_MAX` | `25` | Maximum QKD key pool capacity |
| `TAU_MIN` | `0.4` | Adaptive threshold minimum bound |
| `TAU_MAX` | `0.8` | Adaptive threshold maximum bound |
| `S_CRIT` | `0.85` | Critical sensitivity override trigger |
| `DELIVERY_DEADLINE` | `5.0` | Priority queue dispatch deadline (sec) |
| `MAX_FILE_SIZE_MB` | `25` | Maximum file attachment size (MB) |
| `CORS_ORIGINS` | `*` | Ingress origins (or comma-separated Vercel URLs) |
| `LOG_LEVEL` | `INFO` | Loguru output level |

---

## 5. Phase 4: Vercel (User Client Deployment)

### 5.1 Project Configuration Parameters
Navigate to **[vercel.com](https://vercel.com) ➔ Add New... ➔ Project ➔ Import `pqc-secure-comm`**:

| Parameter Name | Field Label in Vercel UI | Exact Value | Notes |
| :--- | :--- | :--- | :--- |
| `project_name` | **Project Name** | `pqc-user-chat` | URL: `https://pqc-user-chat.vercel.app` |
| `framework` | **Framework Preset** | `Vite` | Auto-detects Vite pipeline |
| `root_directory` | **Root Directory** | `frontend-user` | **Crucial:** click Edit and select `frontend-user` |
| `build_command` | **Build Command** | `npm run build` | Builds bundle into `dist` |
| `output_directory`| **Output Directory** | `dist` | Default Vite build directory |
| `install_command`| **Install Command** | `npm install` | Installs React, Lucide, Tailwind |

### 5.2 Frontend-User Environment Variables
Under **Environment Variables**, add:

| Variable Name | Exact Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://pqc-secure-comm-backend.onrender.com/api/v1` | Production REST endpoints base URL |
| `VITE_WS_URL` | `wss://pqc-secure-comm-backend.onrender.com/ws` | Production secure WebSocket base URL |

---

## 6. Phase 5: Vercel (Supervisor Dashboard Deployment)

### 6.1 Project Configuration Parameters
Navigate to **[vercel.com](https://vercel.com) ➔ Add New... ➔ Project ➔ Import `pqc-secure-comm`**:

| Parameter Name | Field Label in Vercel UI | Exact Value | Notes |
| :--- | :--- | :--- | :--- |
| `project_name` | **Project Name** | `pqc-supervisor-dashboard` | URL: `https://pqc-supervisor-dashboard.vercel.app` |
| `framework` | **Framework Preset** | `Vite` | Auto-detects Vite pipeline |
| `root_directory` | **Root Directory** | `frontend-supervisor` | **Crucial:** click Edit and select `frontend-supervisor` |
| `build_command` | **Build Command** | `npm run build` | Builds bundle into `dist` |
| `output_directory`| **Output Directory** | `dist` | Default Vite build directory |
| `install_command`| **Install Command** | `npm install` | Installs React, Recharts, Lucide |

### 6.2 Frontend-Supervisor Environment Variables
Under **Environment Variables**, add:

| Variable Name | Exact Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://pqc-secure-comm-backend.onrender.com/api/v1` | Production REST endpoints base URL |
| `VITE_WS_URL` | `wss://pqc-secure-comm-backend.onrender.com/ws` | Production secure WebSocket base URL |

---

## 7. Phase 6: Post-Deployment Verification & Seeding

### 7.1 Seed Initial Demo Accounts
To populate your cloud database with demo accounts (Alice, Bob, Charlie, Examiner, Supervisor):
```bash
# Run locally pointing to your cloud MongoDB:
python infra/scripts/seed_users.py --uri "mongodb+srv://pqc_prod_user:DVHt72lg2nCcnSuo@cluster0.tf6kl4m.mongodb.net/pqc_secure_comm?retryWrites=true&w=majority"
```

### 7.2 Backend Health Check
Verify the API is live and databases are connected:
```bash
curl -i https://pqc-secure-comm-backend.onrender.com/api/v1/health
```
**Expected Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected",
  "redis": "connected",
  "qkd_daemon": "active"
}
```

### 7.3 End-to-End Test Matrix
1. **Chat UI Login**: Open `https://pqc-user-chat.vercel.app`, sign in with `alice` / `password123`.
2. **Standard Lane (PQC)**: Send "Hello world". Inspect bubble for `PQC` (ML-KEM/Kyber) badge.
3. **Critical Lane (QKD)**: Toggle High-Security mode or send sensitive keywords (`CLASSIFIED`). Verify `QKD` (256-bit OTP) badge appears.
4. **Live Telemetry Feed**: Open `https://pqc-supervisor-dashboard.vercel.app` in a side window. Verify the live routing feed, queue depth chart, and key pool gauge update in real time.
