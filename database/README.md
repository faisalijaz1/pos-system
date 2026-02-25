# POS Database — Phase 1

PostgreSQL schema and seed data for the web-based POS system.

## Order of execution

1. **01_schema.sql** — Creates all tables, indexes, and the ledger running-balance view.
2. **02_seed_data.sql** — Inserts roles, payment methods, delivery modes, transaction types, business info, default admin user, and units of measure.
3. **03_seed_products.sql** — Optional. Inserts UOMs, brands, categories, and sample products (safe to run on existing DB; use when `/api/v1/products` returns empty).
4. **04_migration_pos_upgrades.sql** — Run once on existing DB to add invoice columns: `change_returned`, `print_without_header`, `print_without_balance`, `invoice_status`, and transaction type `EXCHANGE`. Idempotent (safe to run multiple times on PostgreSQL 9.6+).
5. **07_migration_product_uom_prices.sql** — Creates table `product_uom_prices` (product_id, uom_id, price) for unit-specific selling prices. Run before 08.
6. **08_seed_product_uom_prices.sql** — Seeds per-UOM prices (e.g. Register No 500 Narrow Line: Pcs 10, Dozen 110, Kg 400, etc.). Idempotent.
7. **RUN_ON_RAILWAY_product_uom_prices.sql** — All-in-one for Railway/remote PostgreSQL: runs migration + seed (07+08). Use this to update your Railway database.
8. **05_seed_customers.sql** — Optional. Sample customers and customer accounts for testing.
9. **06_seed_demo_users.sql** — Optional. Adds **manager** and **cashier** users (password: `change_me`) for role-based demo. Run after 02_seed_data.sql. Idempotent (ON CONFLICT DO NOTHING).

## Default users

- **admin** / `change_me` — From 02_seed_data.sql. **Change password in production.**
- **manager** / `change_me` — From 06_seed_demo_users.sql (run after 02).
- **cashier** / `change_me` — From 06_seed_demo_users.sql (run after 02).

See **docs/LOGIN_CREDENTIALS.md** for full list and role access.

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
