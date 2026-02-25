# Implementation and Development Document — Web POS

This document describes the implementation and development setup of the Munir Copy House web-based POS system. It is intended for technical handover, deployment, and future development.

---

## 1. System Overview

### 1.1 Architecture

- **Frontend:** Single-page application (SPA) — React 18, Material UI (MUI), Vite. Communicates with backend via REST API.
- **Backend:** REST API — Java 17, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA.
- **Database:** PostgreSQL 15. All monetary values in PKR; single currency.
- **Deployment:** Docker Compose (PostgreSQL + Backend + Frontend); frontend can be built as static files and served by Nginx or the same backend.

### 1.2 High-Level Flow

```
Browser (React)  →  HTTP + JWT  →  Spring Boot (REST)  →  JPA  →  PostgreSQL
```

- User logs in via `POST /api/v1/auth/login`; receives JWT.
- All subsequent API requests send `Authorization: Bearer <token>`.
- Backend validates token and role; returns data or 401/403.

---

## 2. Repository Structure

```
POS/
├── backend/                    # Spring Boot application
│   ├── src/main/java/com/pos/
│   │   ├── config/             # Web, Security, JPA, CORS
│   │   ├── security/            # JWT filter, UserDetailsService, JwtTokenProvider
│   │   ├── exception/           # GlobalExceptionHandler, ApiError
│   │   ├── domain/              # JPA entities (User, Role, Customer, Product, ...)
│   │   ├── dto/                 # Request/response DTOs
│   │   ├── repository/          # Spring Data JPA repositories
│   │   ├── service/             # Business logic (AuthService, LedgerService, ...)
│   │   └── controller/          # REST controllers
│   ├── src/main/resources/
│   │   ├── application.yml      # Datasource, JWT, CORS
│   │   └── ...
│   └── Dockerfile
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── api/                 # API client (auth, ledger, dashboard, ...)
│   │   ├── components/          # Reusable UI (Sidebar, ProtectedRoute, ...)
│   │   ├── contexts/            # AuthContext
│   │   ├── layouts/             # MainLayout
│   │   ├── pages/               # Dashboard, Login, POS, Products, Customers, Stock, Ledger
│   │   ├── theme/               # MUI theme
│   │   └── App.jsx
│   ├── Dockerfile               # Multi-stage: build with Node, serve with Nginx
│   └── package.json
├── database/
│   ├── 01_schema.sql            # Full schema (roles, users, accounts, products, invoices, ledger, ...)
│   ├── 02_seed_data.sql         # Roles, payment methods, delivery modes, business info, admin user
│   ├── 03_seed_products.sql     # Units, brands, categories, sample products
│   ├── 04_migration_pos_upgrades.sql  # Invoice columns (change_returned, print options, invoice_status)
│   ├── 05_seed_customers.sql    # Sample customers and accounts
│   ├── 06_seed_demo_users.sql   # Manager and Cashier demo users
│   └── README.md
├── docs/
│   ├── CLIENT_PRESENTATION.md   # Client-facing migration presentation
│   ├── LOGIN_CREDENTIALS.md     # All login credentials
│   ├── IMPLEMENTATION_AND_DEVELOPMENT.md  # This document
│   ├── API_ENDPOINTS.md         # API reference
│   ├── PHASE1_DATABASE_DESIGN.md
│   └── PHASE2_BACKEND_ARCHITECTURE.md
└── docker-compose.yml           # postgres, backend, frontend services
```

---

## 3. Database

### 3.1 Execution Order

1. `01_schema.sql` — Creates all tables, indexes, and views (e.g. `v_ledger_running_balance`).
2. `02_seed_data.sql` — Roles, payment methods, delivery modes, transaction types, business info, **admin** user, units, brands, categories, sample products.
3. `03_seed_products.sql` — Optional; more products if needed.
4. `04_migration_pos_upgrades.sql` — Invoice columns for POS (change_returned, print options, invoice_status).
5. `05_seed_customers.sql` — Sample customers and their ledger accounts.
6. `06_seed_demo_users.sql` — **manager** and **cashier** users (password same as admin for demo).

### 3.2 Key Tables

- **roles**, **users** — Authentication and role-based access.
- **accounts** — Chart of accounts (Customer, Supplier, Cash, Bank, Revenue, Inventory, etc.).
- **customers**, **suppliers** — Party master; customers link to `accounts` for balance.
- **products** — Code, name (EN/UR), brand, category, UOM, cost/selling price, min_stock_level, current_stock.
- **sales_invoices**, **sales_invoice_items** — POS invoices; link to customer, branch, delivery mode, payment; items reference products.
- **ledger_entries** — Double-entry; account_id, transaction_date, debit_amount, credit_amount, voucher_no, description, ref_type, ref_id.
- **stock_transactions**, **stock_transaction_items** — Stock in/out.
- **purchase_orders**, **purchase_order_items** — Purchases; receive flow updates stock and ledger.

### 3.3 Docker Init

When using Docker, `01_schema.sql` and `02_seed_data.sql` are typically mounted under `docker-entrypoint-initdb.d/` so they run on first start. Add `03_seed_products.sql`, `05_seed_customers.sql`, and `06_seed_demo_users.sql` to init or run them once after first start (see database/README.md).

---

## 4. Backend Implementation

### 4.1 Tech Stack

- **Java 17**
- **Spring Boot 3.x** (Spring Web, Spring Data JPA, Spring Security)
- **PostgreSQL** driver
- **JWT** (e.g. jjwt) for token generation/validation
- **BCrypt** for password hashing
- **Maven** for build

### 4.2 Security

- **Auth:** `POST /api/v1/auth/login` with `username` and `password`. Server checks user (active, not deleted), verifies password with BCrypt, returns JWT and role.
- **JWT:** Stored in `Authorization: Bearer <token>`. Filter validates token and sets `SecurityContext`. Method-level `@PreAuthorize("hasRole('ADMIN')")` (or MANAGER, CASHIER) enforces access.
- **Roles:** ADMIN (full), MANAGER (no user management), CASHIER (POS, customers, limited modules). See docs/LOGIN_CREDENTIALS.md and PHASE2_BACKEND_ARCHITECTURE.md.

### 4.3 Main Controllers

- **AuthController** — login, optional /auth/me.
- **CustomerController** — CRUD, search, pagination.
- **ProductController** — CRUD, by code, pagination.
- **SalesInvoiceController** — create invoice, get by id/number, list with filters.
- **StockController** — stock in/out, movements.
- **PurchaseOrderController** — create PO, receive (stock in + ledger).
- **LedgerController** — entries (filtered by date/account), report (paginated with opening/running balance), report/print (full report for print), trial balance, manual entry.
- **AccountController** — list, get by id, search (for ledger account picker).
- **DashboardController** — today sales, month-to-date, profit, sales trend, best-selling products, top customers, stock alerts, cash flow.

### 4.4 Ledger Report

- **GET /api/v1/ledger/report** — Query params: `accountId`, `fromDate`, `toDate`, `page`, `size`. Returns opening balance, paginated entries with running balance, period totals, closing balance. Used by the Ledger page and by the print flow.
- **GET /api/v1/ledger/report/print** — Same filters but returns full list of entries (no pagination) for building print HTML. Frontend calls this for “Windows” and “Printer” and writes HTML into a new window.

---

## 5. Frontend Implementation

### 5.1 Tech Stack

- **React 18**
- **React Router 6**
- **Material UI (MUI)**
- **Vite** for build and dev server
- **Axios** for API (or fetch); token attached via interceptor from AuthContext

### 5.2 Auth and Routing

- **AuthContext** — Holds `user`, `token`, `login`, `logout`, `hasRole`. Token and user persisted in `localStorage`.
- **ProtectedRoute** — Wraps routes; redirects to `/login` if not authenticated; optional `roles` prop to restrict by role.
- **Routes:** `/login` (public); `/` (layout) with `/` (Dashboard), `/pos`, `/products`, `/customers`, `/purchases`, `/stock`, `/ledger`. Sidebar filters menu items by `hasRole`.

### 5.3 Key Pages

- **Login** — Form posts to `/api/v1/auth/login`; on success stores token and user, redirects to `/`.
- **Dashboard** — Calls dashboard API (today, MTD, profit, trend, best products, top customers, stock alerts, cash flow); displays KPI cards and charts (e.g. Recharts).
- **POS Billing (PosBillingPage)** — Tabs: New Sale, By Invoice No, Sales History. New sale: customer select, product search, cart, discount, payment, amount received, print options; uses invoice API. By Invoice No: load by invoice number, price comparison, new order. Sales History: list by date, open invoice, edit/delete lines, confirm dialog and snackbar.
- **Products** — List, add, edit, search (code/name); uses product API.
- **Customers** — List, add, edit; uses customer API.
- **Purchases** — Create PO, receive; uses purchase API.
- **Stock** — Stock in/out, movements; uses stock API.
- **Ledger** — Account search (AccountController search), date range, Go loads report (ledger/report). Table: Vch #, Date, Particulars, Dr, Cr, Balance; footer totals; pagination. Buttons: Windows (open report in new window), Export (CSV), Printer (open report in new window with Print/Close toolbar). Manual entry dialog uses ledger manual-entry API.

### 5.4 Print and Export

- **POS print** — Template in `frontend/src/pages/pos/printTemplate.js`; options for without header / without balance; zoom in/out in preview; no auto-print on load.
- **Ledger print** — `LedgerPrintTemplate.js`: builds HTML from report data; `openLedgerPrintWindow()` opens window on click (avoids popup blocker), then fetch report and write HTML; toolbar with Print and Close; `.no-print` hides toolbar when printing.

---

## 6. Development Setup

### 6.1 Prerequisites

- **Node.js** 18+ and npm (or yarn) for frontend
- **Java 17** and Maven for backend
- **PostgreSQL 15** (or use Docker)

### 6.2 Local Run (without Docker)

1. **Database:** Create database `pos_db`, run `01_schema.sql`, `02_seed_data.sql`, then other seeds as needed (03, 04, 05, 06).
2. **Backend:** Set in `application.yml` or env: `spring.datasource.url`, `username`, `password`, `jwt.secret`, `cors.allowed-origins` (e.g. http://localhost:5173). Run `mvn spring-boot:run` (or run from IDE). Backend typically on port 8080.
3. **Frontend:** In `frontend/`, run `npm install` and `npm run dev`. Set API base URL to `http://localhost:8080` (or via env). Vite usually serves on port 5173.
4. **Login:** Use credentials from docs/LOGIN_CREDENTIALS.md (e.g. admin / change_me).

### 6.3 Docker Run

From project root:

```bash
docker compose up -d
```

- **PostgreSQL:** Port 15432 (host) → 5432 (container). User `pos_user`, DB `pos_db`, password `pos_pass` (see docker-compose.yml).
- **Backend:** Port 8080. Health check: `/actuator/health`. Swagger: http://localhost:8080/swagger-ui.html.
- **Frontend:** Port 3000 (served by Nginx in container). Build uses API URL pointing at backend (e.g. same host or backend service name in Docker).

To add demo users (manager, cashier) after first run:

```bash
docker compose exec postgres psql -U pos_user -d pos_db -f /path/to/06_seed_demo_users.sql
```

(or mount `06_seed_demo_users.sql` in `docker-entrypoint-initdb.d` and recreate volume for a clean install.)

---

## 7. Configuration

### 7.1 Backend (application.yml / env)

- **Datasource:** `spring.datasource.url`, `username`, `password`.
- **JWT:** Secret key (e.g. 256-bit for HS256), expiration in ms.
- **CORS:** Allowed origins (e.g. frontend URL). In production use exact origins.

### 7.2 Frontend

- **API base URL:** Configure so frontend calls the correct backend (e.g. `VITE_API_URL=http://localhost:8080` for dev, or relative / full URL in production).
- **Theme:** Light/dark stored in `localStorage`; toggle in app bar.

---

## 8. Deployment (Production)

- **Database:** Run schema and seeds on production PostgreSQL; use strong password and restrict network access.
- **Backend:** Build JAR (`mvn -DskipTests package`); run with `java -jar` or in Docker. Set production `SPRING_DATASOURCE_*`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`. Prefer HTTPS and secure headers.
- **Frontend:** Build (`npm run build`); serve `dist/` with Nginx or static hosting. Ensure API base URL points to production backend.
- **Secrets:** Do not commit passwords or JWT secret; use environment variables or a secrets manager. Change default user passwords (see LOGIN_CREDENTIALS.md).

---

## 9. API Reference

See **docs/API_ENDPOINTS.md** for the list of endpoints, auth requirements, and pagination. Ledger report and report/print are documented in the Ledger section there and in this document (Section 4.4).

---

## 10. Document References

- **CLIENT_PRESENTATION.md** — Client-facing slides: migration summary, new features, why web.
- **LOGIN_CREDENTIALS.md** — All login credentials (admin, manager, cashier) and security notes.
- **API_ENDPOINTS.md** — Quick reference of REST endpoints.
- **PHASE1_DATABASE_DESIGN.md** — Database design rationale.
- **PHASE2_BACKEND_ARCHITECTURE.md** — Backend architecture and security design.

---

*Document: Implementation and Development — Web POS*  
*Version: 1.0*
