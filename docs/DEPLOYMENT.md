# POS — Deployment & Validation

## Full stack from scratch (Docker)

```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

Wait until all services are **healthy** (about 1 minute). Check with:

```bash
docker compose ps
```

- **Frontend:** http://localhost:3000  
- **Backend:** http://localhost:8080  
- **Swagger:** http://localhost:8080/swagger-ui.html  
- **DB (host):** localhost:15432 (use `5432:5432` in `docker-compose.yml` if port 5432 is free)

## If you use the frontend dev server (npm run dev)

The Vite dev server proxies `/api` to **http://localhost:8080**. The backend must be running:

- Either run the full stack with Docker (`docker compose up -d`) so the backend is on 8080, **or**
- Run the Spring Boot backend locally on port 8080 (and ensure Postgres is available).

If the backend is not running, you will see **502 Bad Gateway** for `/api/v1/auth/me` and other API calls.

## Default login (seed)

- **Username:** `admin`  
- **Password:** `change_me`  

(From `database/02_seed_data.sql`. Change in production.)

## Health checks

- **Postgres:** `pg_isready` (interval 5s).  
- **Backend:** `GET /actuator/health` (interval 10s, start period 40s).  
- **Frontend:** `GET /` (interval 10s, start period 5s).  

Frontend starts only after backend is healthy.

## Verification

1. **Frontend:** Open http://localhost:3000 — login page loads.  
2. **Backend:** Open http://localhost:8080/actuator/health — returns `{"status":"UP"}`.  
3. **Login:** Use `admin` / `change_me`, then open **Products** — list loads; use pagination (page, rows per page) and search by name.  
4. **API:** From frontend, Dashboard, POS Billing, Customers, and Products use the backend via `/api` (proxied by nginx to the backend).

## Port conflicts

If `5432` is in use, keep `15432:5432` for Postgres in `docker-compose.yml`.  
If `8080` or `3000` is in use, change the host port in the `ports` section for `backend` or `frontend`.

## Troubleshooting

- **502 Bad Gateway** on `/api/...`  
  Nginx (or Vite proxy) cannot reach the backend. Ensure the backend is running and healthy:  
  - Docker: `docker compose ps` — backend should be "Up (healthy)".  
  - Dev: start the Spring Boot app so it listens on port 8080.

- **500 Internal Server Error** on dashboard APIs  
  Rebuild the backend so it includes the latest dashboard fixes, then restart:  
  `docker compose build backend && docker compose up -d backend`
