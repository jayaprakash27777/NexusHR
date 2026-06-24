# NexusHR — Deployment Guide

## Table of Contents

- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Render (Backend)](#render-backend-deployment)
- [Vercel (Frontend)](#vercel-frontend-deployment)
- [Docker Compose](#docker-compose-deployment)
- [Security Checklist](#security-hardening-checklist)

---

## Environment Variables

### Backend (Spring Boot)

| Variable | Required | Description | Example |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | ✅ Production | PostgreSQL JDBC URL | `jdbc:postgresql://host:5432/nexushr?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | ✅ Production | Database username | `nexushr` |
| `SPRING_DATASOURCE_PASSWORD` | ✅ Production | Database password | *(generated)* |
| `JWT_SECRET` | ✅ Production | JWT signing key (≥32 chars) | `openssl rand -base64 48` |
| `ENCRYPTION_MASTER_KEY` | ✅ Production | AES encryption key (32 hex chars) | `openssl rand -hex 16` |
| `ALLOWED_ORIGINS` | ✅ Production | Comma-separated CORS origins | `https://app.nexushr.com,https://nexushr.vercel.app` |
| `SPRING_PROFILES_ACTIVE` | Optional | Active Spring profile | `docker` |
| `RENDER` | Auto-set | Detected on Render platform | `true` |

### Frontend (Vite)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | ✅ Production | Backend API URL (with `/api`) | `https://api.nexushr.com/api` |
| `VITE_API_BASE_URL` | ✅ Production | Backend base URL (without `/api`) | `https://api.nexushr.com` |
| `VITE_WS_URL` | ✅ Production | WebSocket STOMP endpoint | `https://api.nexushr.com/api/ws` |
| `VITE_APP_NAME` | Optional | Application display name | `NexusHR` |
| `VITE_APP_VERSION` | Optional | Application version | `1.0.0` |

> **Note**: Vite env vars are baked into the frontend at build time. You must rebuild after changing them.

---

## Local Development

The application runs out of the box with embedded PostgreSQL and Redis:

```bash
# Backend (from /backend directory)
./mvnw spring-boot:run

# Frontend (from /frontend directory)
npm install
npm run dev
```

The embedded infrastructure starts automatically:
- **PostgreSQL** on port `5433` (embedded, auto-configured)
- **Redis** on port `6379` (embedded)
- **Backend** on port `8080`
- **Frontend** on port `3000` (Vite dev server)

No `.env` file is needed for local development — safe dev-only defaults are used.

---

## Render (Backend Deployment)

### 1. Create a PostgreSQL Database

1. Go to Render Dashboard → **New** → **PostgreSQL**
2. Note the **Internal Database URL** (JDBC format)

### 2. Deploy the Backend

1. **New** → **Web Service** → Connect your Git repo
2. **Root Directory**: `backend`
3. **Build Command**: `./mvnw clean package -DskipTests`
4. **Start Command**: `java -jar target/*.jar`
5. **Environment Variables**:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://<render-pg-host>:5432/nexushr?sslmode=require
SPRING_DATASOURCE_USERNAME=nexushr
SPRING_DATASOURCE_PASSWORD=<your-db-password>
JWT_SECRET=<generate-with-openssl-rand-base64-48>
ENCRYPTION_MASTER_KEY=<generate-with-openssl-rand-hex-16>
ALLOWED_ORIGINS=https://your-frontend.vercel.app
RENDER=true
```

### 3. Verify

- Health check: `GET https://your-backend.onrender.com/api/health`
- Swagger UI: `https://your-backend.onrender.com/api/swagger-ui.html`

---

## Vercel (Frontend Deployment)

### 1. Import Project

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your Git repository
3. **Framework Preset**: Vite
4. **Root Directory**: `frontend`

### 2. Environment Variables

Set these in Vercel project settings → **Environment Variables**:

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_WS_URL=https://your-backend.onrender.com/api/ws
```

### 3. Build Settings

The `frontend/vercel.json` already configures:
- SPA rewrites (all routes → `index.html`)
- Security headers (X-Frame-Options, HSTS, etc.)

### 4. Update Backend CORS

After deployment, add your Vercel URL to the backend's `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

---

## Docker Compose Deployment

### 1. Configure Environment

```bash
cd deployment
cp .env.example .env
# Edit .env — replace ALL "CHANGE-ME" values
```

### 2. Deploy

```bash
docker-compose up -d
```

### 3. Verify

```bash
# Check all containers are healthy
docker-compose ps

# Check backend health
curl http://localhost:8080/api/health

# Check logs
docker-compose logs -f backend
```

### Services

| Service | Port | Description |
|---|---|---|
| `db` | 5432 | PostgreSQL 16 |
| `backend` | 8080 | Spring Boot API |
| `frontend` | 3000 | Nginx (static) |

---

## Security Hardening Checklist

### ✅ Before First Deployment

- [ ] Generate and set a strong `JWT_SECRET` (≥256 bits)
  ```bash
  openssl rand -base64 48
  ```
- [ ] Generate and set a strong `ENCRYPTION_MASTER_KEY` (32 hex chars)
  ```bash
  openssl rand -hex 16
  ```
- [ ] Set `SPRING_DATASOURCE_PASSWORD` to a strong, unique password
- [ ] Set `ALLOWED_ORIGINS` to your actual production domain(s)
- [ ] Verify no `.env` files are committed to Git
- [ ] Set `VITE_API_URL`, `VITE_API_BASE_URL`, `VITE_WS_URL` to production backend URL

### ✅ Post-Deployment Verification

- [ ] Confirm `EnvironmentValidator` logs show no warnings at startup
- [ ] Test login flow end-to-end
- [ ] Test JWT token refresh
- [ ] Verify CORS: frontend can call backend without errors
- [ ] Verify WebSocket connection works
- [ ] Check that Swagger UI is accessible (or disabled in production)

### ⚠️ Rotate Compromised Secrets

If you previously had secrets committed to Git:

1. **Rotate the Neon DB password** in the Neon dashboard
2. **Generate a new JWT secret** — all existing tokens will be invalidated
3. **Generate a new encryption key** — note: existing encrypted chat messages will need re-encryption
4. Consider running `git filter-branch` or BFG Repo Cleaner to remove secrets from Git history
