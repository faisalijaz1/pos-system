# POS Backend — Spring Boot REST API

Java 17, Spring Boot 3.x, JPA, PostgreSQL, JWT auth.

## Run locally

1. **PostgreSQL:** Start DB and run `database/01_schema.sql` + `02_seed_data.sql`.
2. **Config:** Set in env or `application.yml`:
   - `spring.datasource.url`, `username`, `password`
   - `jwt.secret` (min 32 characters for HS256)
3. **Run:** `mvn spring-boot:run`

Default login (from seed): `admin` / `change_me`.

## Run with Docker

From project root:

```bash
docker compose up -d
```

- API: http://localhost:8080  
- Swagger: http://localhost:8080/swagger-ui.html  

## Build

```bash
mvn clean package -DskipTests
```

JAR: `target/pos-backend-1.0.0-SNAPSHOT.jar`.

## Project layout

- `config` — Web, Security (JWT)
- `security` — JWT filter, token provider, UserDetailsService
- `exception` — Global handler, ApiError, ResourceNotFound, BadRequest
- `domain` — JPA entities
- `dto` — Request/response DTOs
- `repository` — Spring Data JPA
- `service` — Business logic
- `controller` — REST (`/api/v1/...`)

## API versioning

All endpoints are under `/api/v1`. See `docs/API_ENDPOINTS.md` and `docs/PHASE2_BACKEND_ARCHITECTURE.md`.
