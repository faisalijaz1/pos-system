# Railway Deployment — Single-Click Monorepo

Deploy the POS full-stack (React frontend, Spring Boot backend, PostgreSQL) on [Railway](https://railway.app) with **no docker-compose**: native Railway services + managed PostgreSQL.

## Architecture

| Service    | Root Directory | Build           | Runtime        |
|-----------|----------------|------------------|----------------|
| Frontend  | `frontend`     | Dockerfile       | Nginx (static) |
| Backend   | `backend`      | Dockerfile       | JDK 21 JAR     |
| PostgreSQL| —              | Railway managed  | —              |

- **Frontend** calls the backend using `VITE_API_URL` (set at build time).
- **Backend** connects to PostgreSQL using Railway’s `DATABASE_URL` (converted to JDBC in the container entrypoint).

---

## One-Click Deploy from GitHub

### 1. Connect repository

1. Go to [railway.app](https://railway.app) and sign in.
2. **New Project** → **Deploy from GitHub repo** and select this repository.
3. Railway will create one service by default (you will add a second and Postgres next).

### 2. Add PostgreSQL

1. In the project, click **+ New** → **Database** → **PostgreSQL**.
2. Wait until the Postgres service is provisioned.
3. Open the Postgres service → **Variables** (or **Connect**). Copy the **`DATABASE_URL`** (or note that it is auto-injected when you link the service).

### 3. Backend service

1. **+ New** → **GitHub Repo** and select the **same repository** again.
2. Open the new service → **Settings**:
   - **Root Directory**: `backend`
   - **Builder**: Dockerfile (Railway usually auto-detects from `backend/railway.json`).
3. **Variables** (or **Variables** tab):
   - Link Postgres: **Variables** → **Add Reference** → choose the Postgres service’s **`DATABASE_URL`** (so the backend gets `DATABASE_URL` automatically).
   - Optionally set:
     - `JWT_SECRET` — at least 32 characters (e.g. a long random string).
     - `JWT_EXPIRATION_MS` — optional; default 86400000.
4. **Settings** → **Networking** → **Generate Domain** so the backend gets a public URL (e.g. `https://backend-production-xxxx.up.railway.app`).
5. Copy the backend’s public URL; you’ll use it for the frontend.

### 4. Frontend service

1. **+ New** → **GitHub Repo** and select the **same repository** again.
2. Open this service → **Settings**:
   - **Root Directory**: `frontend`
   - **Builder**: Dockerfile (auto-detected from `frontend/railway.json`).
3. **Variables** (and build args):
   - Set **variable** `VITE_API_URL` = backend public URL (e.g. `https://backend-production-xxxx.up.railway.app`).
   - If your frontend image is built with Docker, ensure `VITE_API_URL` is passed as a **build argument** (Railway Build → Build Args or equivalent) so the production build bakes in the correct API URL.
   - **Important:** No trailing slash. Redeploy frontend if the backend URL changes.
4. **Settings** → **Networking** → **Generate Domain** so the frontend has a public URL.

### 5. Deploy

- Push to the connected branch (e.g. `main`); Railway builds and deploys the service(s) that changed.
- Open the frontend’s public URL to use the app.

---

## Environment variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (Railway) | Set automatically when Postgres is linked. Entrypoint converts to `SPRING_DATASOURCE_URL`. |
| `JWT_SECRET` | Recommended | Secret for JWT (min 32 chars). |
| `JWT_EXPIRATION_MS` | No | Token lifetime in ms; default `86400000`. |
| `SERVER_PORT` | No | Default `8080`. |
| `CORS_ALLOWED_ORIGINS` | Production | Comma-separated origins (e.g. frontend URL). Default `*`. |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (production) | Backend public URL (e.g. `https://backend-xxx.up.railway.app`). Used at **build** time. |

---

## Config files

- **`railway.json`** (project root): Short description; no build config (each service has its own root).
- **`frontend/railway.json`**: Dockerfile builder, deploy options. Used when Root Directory = `frontend`.
- **`backend/railway.json`**: Dockerfile builder, deploy options. Used when Root Directory = `backend`.

Railway config path is from repo root (e.g. `/frontend/railway.json`, `/backend/railway.json`) when configuring the service.

---

## Production notes

1. **Database**
   - Run schema and seed once (e.g. via Railway CLI or a one-off job):
     - `database/01_schema.sql`
     - `database/02_seed_data.sql`
     - `database/03_seed_products.sql` (optional; for sample products).
2. **CORS**
   - Backend should allow the frontend origin. If you use `CORS_ALLOWED_ORIGINS`, set it to the frontend’s Railway URL (e.g. `https://frontend-xxx.up.railway.app`).
3. **Zero manual config**
   - With Postgres linked to the backend, `DATABASE_URL` is set automatically; the backend entrypoint converts it to JDBC. No need to set `SPRING_DATASOURCE_*` manually.
4. **Inter-service**
   - Frontend talks to backend over the public HTTPS URL. No internal Railway hostnames are required for this setup.

---

## Summary checklist

- [ ] New Railway project from GitHub.
- [ ] Add PostgreSQL and note/link `DATABASE_URL`.
- [ ] Backend service: Root = `backend`, link Postgres, generate domain, set `JWT_SECRET`.
- [ ] Frontend service: Root = `frontend`, set `VITE_API_URL` to backend URL, generate domain.
- [ ] Run DB migrations/seed (schema + seed SQL).
- [ ] Set backend `CORS_ALLOWED_ORIGINS` to the frontend public URL (recommended in production).
