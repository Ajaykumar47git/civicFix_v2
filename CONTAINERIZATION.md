# CivicFix — Containerization & Orchestration Guide (Phase 8)

**Document Version:** 1.0.0  
**Architect:** Senior DevOps & Cloud Infrastructure Architect  
**Classification:** Municipal Enterprise Production Deployment Guide  
**Standard:** OCI (Open Container Initiative) &bull; Docker Compose v2 &bull; 12-Factor App Compliance  

---

## Table of Contents
1. [Architecture & Container Topology](#1-architecture--container-topology)
2. [Artifact Manifest](#2-artifact-manifest)
3. [Container Specifications](#3-container-specifications)
   - 3.1 Backend Service (`Dockerfile.backend`)
   - 3.2 Frontend Service & Reverse Proxy (`Dockerfile.frontend`)
   - 3.3 Database Service (PostgreSQL 16 + PostGIS)
   - 3.4 Caching Service (Redis 7)
4. [Environment Variables & Secret Governance](#4-environment-variables--secret-governance)
5. [Commands to Build & Run](#5-commands-to-build--run)
   - 5.1 Production Deployment (`docker-compose.yml`)
   - 5.2 Local Development with Hot Reloading (`docker-compose.dev.yml`)
   - 5.3 Standalone Container Execution
6. [Inter-Service Networking & Communication](#6-inter-service-networking--communication)
7. [Database Migrations & Initial Data Seeding](#7-database-migrations--initial-data-seeding)
8. [Health Checks, Monitoring & Observability](#8-health-checks-monitoring--observability)
9. [Comprehensive Troubleshooting Guide](#9-comprehensive-troubleshooting-guide)

---

## 1. Architecture & Container Topology

CivicFix is architected using a microservices-ready multi-tier container topology. All containers operate within an isolated Docker bridge network (`civicfix_network`), exposing only standard HTTP/HTTPS ingress ports to the host:

```
[ Browser / Citizen Client ]
            │
            ▼ Port 80
┌─────────────────────────────────────────────────────────┐
│  civicfix_frontend (Nginx 1.27 Alpine)                  │
│  - Serves React 19 SPA static assets                    │
│  - Gzip compression & Security Headers                  │
│  - Reverse proxies /api/* requests to Backend upstream  │
└───────────────────────────┬─────────────────────────────┘
                            │ Internal Docker Network (civicfix_network)
                            ▼ Port 3000
┌─────────────────────────────────────────────────────────┐
│  civicfix_backend (Node.js 20 Alpine)                   │
│  - Express REST API Gateway (RFC 7807 Error Handlers)   │
│  - Stateless JWT Authentication Engine                  │
│  - SLA Deadline & Geospatial Validation Logic           │
└──────────────┬──────────────────────────┬───────────────┘
               │                          │
               ▼ Port 5432                ▼ Port 6379
┌──────────────────────────────┐ ┌──────────────────────────────┐
│  civicfix_db                 │ │  civicfix_redis              │
│  PostgreSQL 16 + PostGIS 3.4 │ │  Redis 7 In-Memory Cache     │
│  - Persistent volume storage │ │  - Rate Limiting             │
│  - Spatial R-Tree indexes    │ │  - Session & Token Revoke    │
└──────────────────────────────┘ └──────────────────────────────┘
```

---

## 2. Artifact Manifest

The repository includes complete containerization artifacts:
- **`Dockerfile.backend`**: Multi-stage production container for the Node.js Express backend.
- **`Dockerfile.frontend`**: Multi-stage container compiling the React SPA and serving via Nginx.
- **`Dockerfile`**: Unified container for single-host / Cloud Run serverless deployments.
- **`nginx.conf`**: Optimized reverse proxy, SPA fallback router, and security headers.
- **`docker-compose.yml`**: Production composition with PostgreSQL, Redis, Backend, and Frontend.
- **`docker-compose.dev.yml`**: Development composition with hot-reloading (`tsx`), live Vite HMR, and source bind-mounts.
- **`.dockerignore`**: Optimization filter preventing `.git`, `node_modules`, and `.env` leaks.
- **`.env.docker.example`**: Complete template for production environment variables.

---

## 3. Container Specifications

### 3.1 Backend Service (`Dockerfile.backend`)
- **Base Image:** `node:20-alpine` (minimal CVE surface, ~150MB footprint).
- **Multi-Stage Build:**
  - `builder` stage: Compiles TypeScript using `esbuild` to `dist/server.cjs` and bundles Vite assets.
  - `runner` stage: Production-only packages installed via `npm ci --only=production`.
- **Security Hardening:**
  - Runs as unprivileged system user (`civicfix:nodejs`, UID 1001).
  - Uses `dumb-init` as PID 1 to reap zombie processes and handle `SIGTERM`/`SIGINT`.
- **Healthcheck:** Evaluates `curl -f http://localhost:3000/api/health` every 30s.

### 3.2 Frontend Service & Reverse Proxy (`Dockerfile.frontend` & `nginx.conf`)
- **Base Image:** `nginx:1.27-alpine` (~25MB footprint).
- **Static Assets:** Cached aggressively with `Cache-Control: public, max-age=15552000, immutable`.
- **Security Headers:** Enforces `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, and `X-XSS-Protection`.
- **Reverse Proxy:** Transparently forwards `/api/` traffic to `http://backend:3000/api/` with WebSocket upgrade headers.

### 3.3 Database Service (PostgreSQL 16 + PostGIS)
- **Base Image:** `postgis/postgis:16-3.4-alpine`.
- **Storage:** Persisted in named volume `civicfix_pgdata` mapping to `/var/lib/postgresql/data`.
- **Healthcheck:** `pg_isready -U ${DB_USER} -d ${DB_NAME}` ensuring backend doesn't start until DB is ready.

### 3.4 Caching Service (Redis 7)
- **Base Image:** `redis:7-alpine`.
- **Persistence:** AOF (Append-Only File) enabled, mapped to `civicfix_redisdata`.
- **Security:** Password-protected via `requirepass`.

---

## 4. Environment Variables & Secret Governance

All credentials and dynamic configs are injected via environment variables. **Zero hardcoded secrets exist in container images.**

| Variable | Description | Default / Example | Required in Prod |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Runtime mode | `production` | Yes |
| `PORT` | Backend listening port | `3000` | Yes |
| `DB_NAME` | PostgreSQL database name | `civicfix` | Yes |
| `DB_USER` | PostgreSQL superuser/app user | `civicfix_admin` | Yes |
| `DB_PASSWORD` | PostgreSQL database password | *Strong generated password* | **CRITICAL** |
| `DATABASE_URL` | Full database connection string | `postgresql://user:pass@db:5432/civicfix` | Yes |
| `REDIS_PASSWORD`| Redis authentication password | *Strong generated password* | Yes |
| `REDIS_URL` | Redis connection URL | `redis://:pass@redis:6379` | Yes |
| `JWT_SECRET` | HMAC-SHA256 signature key (min 32 chars) | *High entropy random string* | **CRITICAL** |
| `JWT_EXPIRATION`| Token lifetime | `900s` (15 minutes) | Yes |
| `REFRESH_TOKEN_SECRET`| Refresh token signing key | *High entropy random string* | **CRITICAL** |
| `CORS_ORIGIN` | Allowed web origin for CORS | `http://localhost` | Yes |
| `APP_URL` | Base application URL | `http://localhost` | Yes |

---

## 5. Commands to Build & Run

### 5.1 Production Deployment

```bash
# 1. Clone the repository and navigate to root
cd civicfix

# 2. Copy and configure production environment variables
cp .env.docker.example .env
# Edit .env with your production database credentials and cryptographic secrets
nano .env

# 3. Build container images with clean cache
docker compose build --no-cache

# 4. Launch all 4 microservices in detached daemon mode
docker compose up -d

# 5. Verify container status and healthchecks
docker compose ps
```

### 5.2 Local Development with Hot Reloading

```bash
# Start development environment with live file bind mounts
docker compose -f docker-compose.dev.yml up --build

# View real-time aggregated service logs
docker compose -f docker-compose.dev.yml logs -f app
```

### 5.3 Standalone Container Execution

```bash
# Build standalone full-stack container
docker build -t civicfix-app:latest .

# Run standalone container with external database
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://user:pass@host:5432/civicfix" \
  -e JWT_SECRET="your_32_char_secret_key_here_!" \
  --name civicfix_standalone \
  civicfix-app:latest
```

---

## 6. Inter-Service Networking & Communication

1. **Docker Internal DNS Resolution:** Containers communicate via service names defined in `docker-compose.yml`:
   - Backend accesses database at `db:5432`
   - Backend accesses cache at `redis:6379`
   - Frontend Nginx proxies to `backend:3000`
2. **Network Isolation:** The bridge network `civicfix_network` prevents external traffic from reaching PostgreSQL port 5432 or Redis port 6379 directly unless mapped to the host.
3. **Graceful Dependency Orchestration:** Backend uses `depends_on` with `condition: service_healthy` to guarantee PostgreSQL has executed internal setup scripts and accepts connections before Express attempts connection initialization.

---

## 7. Database Migrations & Initial Data Seeding

```bash
# Run database schema migrations inside the running backend container
docker compose exec backend npm run db:migrate

# Seed municipal categories, demo personas, and council ward boundaries
docker compose exec backend npm run db:seed

# Inspect database directly via psql CLI
docker compose exec db psql -U civicfix_admin -d civicfix -c "SELECT COUNT(*) FROM issues;"
```

---

## 8. Health Checks, Monitoring & Observability

```bash
# Inspect real-time resource utilization (CPU, Memory, I/O)
docker stats civicfix_backend civicfix_frontend civicfix_db civicfix_redis

# Query backend health endpoint directly
curl -i http://localhost:3000/api/health

# Query frontend health endpoint
curl -i http://localhost/healthz

# Stream backend application logs with timestamps
docker compose logs -f --tail=100 backend
```

---

## 9. Comprehensive Troubleshooting Guide

### Issue 1: Port Conflict (`Bind for 0.0.0.0:80 failed: port is already allocated`)
- **Root Cause:** Another process (e.g., Apache, local Nginx, or Skype) is already bound to port 80 on the host.
- **Remediation:**
  1. Find conflicting process: `sudo lsof -i :80` or `sudo netstat -tulpn | grep :80`.
  2. Alternatively, modify `FRONTEND_PORT` in `.env` to an open port (e.g., `FRONTEND_PORT=8080`).
  3. Restart containers: `docker compose up -d`.

### Issue 2: Backend Fails with Database Connection Refused (`ECONNREFUSED db:5432`)
- **Root Cause:** Backend attempted connection before PostgreSQL completed startup, or credentials in `DATABASE_URL` do not match `POSTGRES_USER`/`POSTGRES_PASSWORD`.
- **Remediation:**
  1. Inspect database logs: `docker compose logs db`.
  2. Verify DB healthcheck status: `docker inspect --format='{{json .State.Health.Status}}' civicfix_db`.
  3. Ensure `depends_on` in `docker-compose.yml` specifies `condition: service_healthy`.
  4. Verify that `POSTGRES_USER` and `POSTGRES_PASSWORD` match the user and password in `DATABASE_URL`.

### Issue 3: Frontend Shows 502 Bad Gateway on `/api/*` Requests
- **Root Cause:** Nginx cannot communicate with upstream `backend:3000`.
- **Remediation:**
  1. Confirm backend container is running: `docker compose ps backend`.
  2. Confirm Nginx DNS resolution: `docker compose exec frontend ping backend`.
  3. Inspect Nginx error log: `docker compose logs frontend`.
  4. Ensure both `frontend` and `backend` services share the `civicfix_network` bridge.

### Issue 4: Permissions Denied on Volume Mounts (`EACCES` / `Permission Denied`)
- **Root Cause:** The unprivileged container user `civicfix` (UID 1001) lacks read/write permissions on host-mounted directories.
- **Remediation:**
  - Run: `sudo chown -R 1001:1001 ./dist` or use named Docker volumes rather than host bind-mounts for production.

### Issue 5: Container Crashes with Out Of Memory (`OOMKilled: true`)
- **Root Cause:** Container memory usage exceeded hard limits configured under `deploy.resources.limits.memory`.
- **Remediation:**
  1. Inspect container exit code: `docker inspect civicfix_backend --format='{{.State.OOMKilled}}'`.
  2. Increase memory limit in `docker-compose.yml` (e.g., raise from `1024M` to `2048M`).
  3. Run Node.js with heap flag: `NODE_OPTIONS="--max-old-space-size=1536"`.
