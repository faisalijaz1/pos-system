# POS Database — Phase 1

PostgreSQL schema and seed data for the web-based POS system.

## Order of execution

1. **01_schema.sql** — Creates all tables, indexes, and the ledger running-balance view.
2. **02_seed_data.sql** — Inserts roles, payment methods, delivery modes, transaction types, business info, default admin user, and units of measure.
3. **03_seed_products.sql** — Optional. Inserts UOMs, brands, categories, and sample products (safe to run on existing DB; use when `/api/v1/products` returns empty).

## Default admin

- **Username:** `admin`
- **Password:** `change_me` (BCrypt hash in seed; **must** be changed after first login in production)

## Running with Docker

From project root (when Docker setup is in place):

```bash
# If DB was just created by Docker, init scripts 01 and 02 already ran. If /api/v1/products returns empty, run:
docker compose exec postgres psql -U pos_user -d pos_db -f /docker-entrypoint-initdb.d/03_seed_products.sql
```

To run schema + full seed manually (e.g. after a clean volume):

```bash
docker compose exec postgres psql -U pos_user -d pos_db -f /docker-entrypoint-initdb.d/01_schema.sql
docker compose exec postgres psql -U pos_user -d pos_db -f /docker-entrypoint-initdb.d/02_seed_data.sql
docker compose exec postgres psql -U pos_user -d pos_db -f /docker-entrypoint-initdb.d/03_seed_products.sql
```

Or from the host (with `PGPASSWORD=pos_pass`):

```bash
psql -h localhost -p 15432 -U pos_user -d pos_db -f database/03_seed_products.sql
```

## Notes

- Ledger balances are derived from `ledger_entries`; `accounts.current_balance` can be updated by application logic for display performance.
- Running balance for reports: use view `v_ledger_running_balance` or compute in API.
- All monetary columns use `NUMERIC(18,2)`; PKR assumed.
