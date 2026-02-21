# Phase 2 — Backend Architecture & API Design

## Web-Based POS — Spring Boot REST API

**Tech stack:** Java 17+, Spring Boot 3.x, Spring Data JPA, PostgreSQL, Spring Security (JWT), Maven, Docker.

---

## 1. System Architecture

### 1.1 Layered Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Controllers (REST)  │  /api/v1/...  │  Request/Response DTOs             │
├─────────────────────────────────────────────────────────────────────────┤
│  Service Layer       │  Business logic, transactions, orchestration       │
├─────────────────────────────────────────────────────────────────────────┤
│  Repository Layer    │  Spring Data JPA — persistence                      │
├─────────────────────────────────────────────────────────────────────────┤
│  Domain (Entities)   │  JPA entities mapping to Phase 1 schema           │
└─────────────────────────────────────────────────────────────────────────┘
Supporting: config, security (JWT), exception (global handler), dto, mapper, util
```

### 1.2 Package Structure

```
com.pos
├── config              # Web, Security, JPA, CORS, OpenAPI
├── security            # JWT filter, UserDetails, token provider
├── exception           # GlobalExceptionHandler, ApiError, ResourceNotFoundException
├── util                # Pagination, constants
├── domain              # JPA entities (Role, User, Customer, Product, ...)
├── dto                 # Request/response DTOs
├── mapper              # Entity ↔ DTO mappers (MapStruct or manual)
├── repository          # JPA repositories
├── service             # Business services
└── controller          # REST controllers
    ├── AuthController
    ├── CustomerController
    ├── SupplierController
    ├── ProductController
    ├── BrandController
    ├── CategoryController
    ├── UnitController
    ├── AccountController
    ├── BankAccountController
    ├── SalesInvoiceController
    ├── StockController
    ├── PurchaseOrderController
    ├── LedgerController
    ├── CustomerReceiptController
    ├── SupplierPaymentController
    ├── DashboardController
    └── ReportController (optional)
```

---

## 2. Security Architecture (JWT)

### 2.1 Flow

```
1. Client POST /api/v1/auth/login { "username", "password" }
2. Server validates credentials (BCrypt), loads user + role
3. Server returns JWT (access token) + optional refresh token
4. Client sends: Authorization: Bearer <token> on every request
5. JwtAuthenticationFilter:
   - Extracts token from header
   - Validates signature and expiry
   - Loads UserDetails, sets SecurityContext
6. Method security (@PreAuthorize) enforces role per endpoint
```

### 2.2 Role-Based Access

| Role    | Permissions |
|---------|-------------|
| ADMIN   | Full system access (all modules) |
| MANAGER | Dashboard, Reports, Ledger, Stock, Master data; no user/role management |
| CASHIER | POS (create invoice, get invoice), Customers, Customer Receipts; read-only for products/units |

### 2.3 Implementation Notes

- **Login:** `AuthController.login(LoginRequest)` → `AuthService.authenticate()` → BCrypt check → `JwtTokenProvider.generateToken(user)` → `LoginResponse { token, username, role, expiresAt }`.
- **Filter:** `JwtAuthenticationFilter` extends `OncePerRequestFilter`; for `/api/v1/**` (except `/api/v1/auth/login`), parse Bearer token and set `SecurityContextHolder`.
- **Password:** Store BCrypt hash in DB; on login compare with `PasswordEncoder.matches(raw, hash)`.

---

## 3. API Endpoint Design

Base path: **`/api/v1`**. All responses use consistent envelope where needed: `{ "data": ..., "message": "..." }` or direct body. Pagination: `page`, `size`, `sort`; response: `{ "content": [...], "totalElements", "totalPages", "number", "size" }`.

### 3.1 Auth Module

| Method | Endpoint | Description | Request / Response |
|--------|----------|-------------|--------------------|
| POST   | `/auth/login` | Login, get JWT | Req: `{ "username": "admin", "password": "change_me" }` → Res: `{ "token": "eyJ...", "username": "admin", "role": "ADMIN", "expiresAt": "..." }` |
| POST   | `/auth/refresh` | Optional refresh token | Res: `{ "token": "..." }` |
| GET    | `/auth/me` | Current user info | Res: `{ "userId", "username", "fullName", "role" }` |

### 3.2 Master Data — Customers

| Method | Endpoint | Description | Pagination |
|--------|----------|-------------|------------|
| GET    | `/customers` | List (filter: name, city) | Yes |
| GET    | `/customers/{id}` | By ID | — |
| GET    | `/customers/code/{code}` | By customer code | — |
| POST   | `/customers` | Create | — |
| PUT    | `/customers/{id}` | Update | — |
| DELETE | `/customers/{id}` | Soft delete (set deleted_at) | — |

**Sample request (POST):** `{ "accountId", "customerCode", "name", "nameEnglish", "contactPerson", "mobile", "address", "city", "phone", "fax", "email", "goodsCompany", "reference", "creditLimit", "joiningDate" }`

### 3.3 Master Data — Suppliers

| Method | Endpoint | Description | Pagination |
|--------|----------|-------------|------------|
| GET    | `/suppliers` | List (filter: name) | Yes |
| GET    | `/suppliers/{id}` | By ID | — |
| POST   | `/suppliers` | Create | — |
| PUT    | `/suppliers/{id}` | Update | — |
| DELETE | `/suppliers/{id}` | Soft delete | — |

### 3.4 Master Data — Products, Brands, Categories, Units

| Method | Endpoint | Description | Pagination |
|--------|----------|-------------|------------|
| GET    | `/products` | List (filter: code, name, brandId, categoryId) | Yes |
| GET    | `/products/{id}` | By ID | — |
| GET    | `/products/code/{code}` | By code | — |
| POST   | `/products` | Create | — |
| PUT    | `/products/{id}` | Update | — |
| DELETE | `/products/{id}` | Soft delete | — |
| GET    | `/brands` | List all | Optional |
| GET    | `/brands/{id}` | By ID | — |
| POST   | `/brands` | Create | — |
| PUT    | `/brands/{id}` | Update | — |
| GET    | `/categories` | List all | Optional |
| GET    | `/categories/{id}` | By ID | — |
| POST   | `/categories` | Create | — |
| PUT    | `/categories/{id}` | Update | — |
| GET    | `/units` | List all | — |
| GET    | `/units/{id}` | By ID | — |
| POST   | `/units` | Create | — |
| PUT    | `/units/{id}` | Update | — |

### 3.5 Master Data — Accounts & Bank Accounts

| Method | Endpoint | Description | Pagination |
|--------|----------|-------------|------------|
| GET    | `/accounts` | List (filter: type, code) | Yes |
| GET    | `/accounts/{id}` | By ID | — |
| POST   | `/accounts` | Create | — |
| PUT    | `/accounts/{id}` | Update | — |
| GET    | `/bank-accounts` | List | Yes |
| GET    | `/bank-accounts/{id}` | By ID | — |
| POST   | `/bank-accounts` | Create | — |
| PUT    | `/bank-accounts/{id}` | Update | — |

### 3.6 POS — Sales Invoices

| Method | Endpoint | Description | Request / Response |
|--------|----------|-------------|--------------------|
| POST   | `/invoices` | Create invoice + items | Req: `{ "branchId", "customerId", "invoiceDate", "invoiceTime", "transactionTypeId", "deliveryModeId", "isCashCustomer", "items": [{ "productId", "quantity", "unitPrice", "uomId" }], "additionalDiscount", "additionalExpenses", "amountReceived", "remarks", "billingNo", "billingDate", "billingPacking", "billingAdda" }` → compute grandTotal, netTotal; persist invoice + items; optional ledger entry + stock decrease |
| GET    | `/invoices/{id}` | By ID | Res: invoice + items |
| GET    | `/invoices/number/{invoiceNumber}` | By invoice number | Res: invoice + items |
| GET    | `/invoices` | List (params: fromDate, toDate, customerId) | Paginated |
| GET    | `/invoices/summary` | Sales summary (params: fromDate, toDate, groupBy=day|month|year) | Res: `{ "totalSales", "totalInvoices", "rows": [{ "period", "amount", "count" }] }` |

### 3.7 Stock APIs

| Method | Endpoint | Description | Request / Response |
|--------|----------|-------------|--------------------|
| POST   | `/stock/in` | Stock in | Req: `{ "branchId", "transactionDate", "description", "items": [{ "productId", "quantityChange", "priceAtTransaction" }] }` → create stock_transaction (type Stock In) + items; increase product.current_stock |
| POST   | `/stock/out` | Stock out | Same shape; quantityChange negative or separate flag; decrease current_stock |
| GET    | `/stock/movements` | Movements (params: fromDate, toDate, productId) | Paginated |
| GET    | `/stock/alerts` | Low stock (current_stock < min_stock_level) | Res: list of products with stock & min level |

### 3.8 Ledger APIs

| Method | Endpoint | Description | Request / Response |
|--------|----------|-------------|--------------------|
| GET    | `/ledger/account/{accountId}` | Ledger by account (params: fromDate, toDate) | Res: `{ "accountId", "accountCode", "accountName", "balance", "entries": [{ "voucherNo", "date", "description", "debit", "credit", "runningBalance" }] }` |
| GET    | `/ledger/customer/{customerId}` | Customer ledger (resolve account from customer) | Same structure |
| GET    | `/ledger/supplier/{supplierId}` | Supplier ledger | Same structure |
| GET    | `/ledger/cash-bank` | Cash/Bank ledger (params: accountId or bankAccountId, fromDate, toDate) | Same structure |
| GET    | `/ledger/trial-balance` | Trial balance (params: asOfDate) | Res: `{ "rows": [{ "accountCode", "accountName", "debit", "credit" }], "totalDebit", "totalCredit" }` |

### 3.9 Customer Receipts & Supplier Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/customer-receipts` | Create receipt; post ledger (credit customer, debit bank) |
| GET    | `/customer-receipts/{id}` | By ID |
| GET    | `/customer-receipts` | List (params: customerId, fromDate, toDate), paginated |
| POST   | `/supplier-payments` | Create payment; post ledger (debit supplier, credit bank) |
| GET    | `/supplier-payments/{id}` | By ID |
| GET    | `/supplier-payments` | List (params: supplierId, fromDate, toDate), paginated |

### 3.10 Dashboard Analytics (X-Factor)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET    | `/dashboard/today-sales` | Today's sales total | `{ "totalSales", "invoiceCount" }` |
| GET    | `/dashboard/month-to-date` | MTD sales | `{ "totalSales", "invoiceCount", "fromDate", "toDate" }` |
| GET    | `/dashboard/profit` | Profit (params: fromDate, toDate) | `{ "revenue", "cost", "profit", "marginPercent" }` |
| GET    | `/dashboard/best-selling-products` | Top N (params: fromDate, toDate, limit=10) | `{ "items": [{ "productId", "productName", "quantitySold", "revenue" }] }` |
| GET    | `/dashboard/top-customers` | Top by sales (params: fromDate, toDate, limit=10) | `{ "items": [{ "customerId", "customerName", "totalSales", "invoiceCount" }] }` |
| GET    | `/dashboard/sales-trend` | Daily trend (params: fromDate, toDate) | `{ "data": [{ "date", "amount", "count" }] }` |
| GET    | `/dashboard/cash-flow` | Cash flow summary (params: fromDate, toDate) | `{ "inflows", "outflows", "net", "byAccount": [...] }` |
| GET    | `/dashboard/stock-alerts` | Low stock list | `{ "items": [{ "productId", "code", "name", "currentStock", "minLevel" }] }` |

---

## 4. Database → Entity Mapping Strategy

- **Naming:** Tables use snake_case; JPA entities use camelCase. Use `@Table(name = "sales_invoices")`, `@Column(name = "invoice_number")` where names differ.
- **Soft delete:** For `users`, `customers`, `suppliers`, `products` add `deletedAt` (Instant or LocalDateTime). In queries, filter `WHERE deleted_at IS NULL` (e.g. `@Where(clause = "deleted_at IS NULL")` on entity or in repository).
- **Audit:** Populate `created_at`/`updated_at` via `@EntityListeners(AuditingEntityListener.class)` and `@CreatedDate`/`@LastModifiedDate` on `createdAt`/`updatedAt`.
- **Pagination:** All list APIs use `Pageable`; return `Page<Dto>`.
- **Ledger balance:** Compute running balance in service layer from `ledger_entries` ordered by `transaction_date`, `ledger_entry_id`; or use DB view `v_ledger_running_balance` and map to DTO.

---

## 5. Exception Handling & Logging

- **Centralized:** `@RestControllerAdvice` with `@ExceptionHandler` for:
  - `ResourceNotFoundException` → 404
  - `BadRequestException` / `IllegalArgumentException` → 400
  - `AccessDeniedException` → 403
  - `AuthenticationException` → 401
  - Generic `Exception` → 500
- **Body:** `{ "timestamp", "status", "error", "message", "path" }` (and optional `details`).
- **Logging:** SLF4J; log request/response (or IDs) at DEBUG; log exceptions at ERROR with stack trace.

---

## 6. Docker Deployment Plan

### 6.1 Images

- **Backend:** Dockerfile multi-stage: build with Maven (Java 17), run with `java -jar app.jar`. Expose 8080.
- **PostgreSQL:** Official image `postgres:15-alpine`. Environment: POSTGRES_DB=pos_db, POSTGRES_USER, POSTGRES_PASSWORD. Volume for data. Init scripts: mount `database/01_schema.sql` and `02_seed_data.sql` as init (or run once after first start).

### 6.2 docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: pos_db
      POSTGRES_USER: pos_user
      POSTGRES_PASSWORD: pos_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/01_schema.sql:/docker-entrypoint-initdb.d/01_schema.sql
      - ./database/02_seed_data.sql:/docker-entrypoint-initdb.d/02_seed_data.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pos_user -d pos_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/pos_db
      SPRING_DATASOURCE_USERNAME: pos_user
      SPRING_DATASOURCE_PASSWORD: pos_pass
      JWT_SECRET: ${JWT_SECRET:-your-256-bit-secret}
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
```

- **Production:** Use secrets for DB password and JWT_SECRET; do not commit secrets. Railway: use env vars / secrets in dashboard.

### 6.3 Running

- `docker compose up -d` to start Postgres + backend.
- First run: Postgres runs init scripts; backend connects after DB is healthy.

---

## 7. API Versioning & Best Practices

- **Versioning:** All APIs under `/api/v1`. Future: `/api/v2` for breaking changes.
- **Pagination:** Default `page=0`, `size=20`, max size 100.
- **Sort:** `sort=invoiceDate,desc`.
- **High-performance SQL:** Use indexed columns in WHERE (invoice_date, account_id, customer_id); avoid N+1 (fetch join or DTO projections where needed).
- **Idempotency:** Create invoice is POST; idempotency key optional for future.

---

*Document version: 1.0 — Phase 2 Backend Architecture. Proceed to implementation; frontend only after backend approval.*
