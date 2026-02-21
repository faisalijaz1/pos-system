# POS Backend — API Endpoints Reference

Base URL: `http://localhost:8080/api/v1`  
Auth: `Authorization: Bearer <token>`

---

## Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | No | Login. Body: `{ "username", "password" }`. Returns `{ "token", "username", "role", "expiresAt" }`. |
| GET | `/auth/me` | Yes | Current user. Returns `{ "username", "authorities" }`. |

---

## Customers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/customers` | Yes | List (paginated). Params: `name`, `page`, `size`, `sort`. |
| GET | `/customers/{id}` | Yes | Get by ID. |

---

## Invoices (POS)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/invoices` | Yes | Create invoice (header + items, stock out, ledger). Body: see CreateInvoiceRequest. |
| GET | `/invoices/{id}` | Yes | Get invoice by ID (with items). |
| GET | `/invoices/number/{invoiceNumber}` | Yes | Get invoice by number (with items). |
| GET | `/invoices` | Yes | List (paginated). Params: `fromDate`, `toDate`, `customerId`, `page`, `size`, `sort`. |

---

## Stock

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/stock/in` | Yes | Stock in. Body: branchId, transactionDate, description, items[{ productId, quantity, priceAtTransaction }]. |
| POST | `/stock/out` | Yes | Stock out. Body: same. Validates stock and deducts. |
| GET | `/stock/movements` | Yes | List movements. Params: fromDate, toDate, productId, page, size, sort. |

---

## Ledger

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/ledger/manual-entry` | ADMIN, MANAGER | Manual double-entry. Body: voucherNo, transactionDate, description, debitAccountId, creditAccountId, amount, refType?, refId?. |
| GET | `/ledger/entries` | Yes | List entries. Params: fromDate, toDate, accountId, page, size, sort. |
| GET | `/ledger/trial-balance` | ADMIN, MANAGER | Trial balance. Params: asOfDate (default today). |

---

## Purchases

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/purchases` | ADMIN, MANAGER | Create purchase order (draft). Body: orderNumber, supplierId, orderDate, remarks, items[{ productId, quantity, unitPrice, uomId }]. |
| POST | `/purchases/{id}/receive` | ADMIN, MANAGER | Receive PO: Stock IN + Ledger Dr Inventory Cr Supplier. |
| GET | `/purchases/{id}` | Yes | Get purchase order by ID. |
| GET | `/purchases` | Yes | List. Params: fromDate, toDate, supplierId, page, size, sort. |

---

## Dashboard (real analytics)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/today-sales` | ADMIN, MANAGER | Today's total sales and invoice count. |
| GET | `/dashboard/month-to-date` | ADMIN, MANAGER | MTD total sales, invoice count, fromDate, toDate. |
| GET | `/dashboard/profit` | ADMIN, MANAGER | Revenue, cost, profit, margin %. Params: `fromDate`, `toDate`. |
| GET | `/dashboard/best-selling-products` | ADMIN, MANAGER | Top products by qty sold and revenue. Params: `fromDate`, `toDate`, `limit` (max 100). |
| GET | `/dashboard/top-customers` | ADMIN, MANAGER | Top customers by total sales. Params: `fromDate`, `toDate`, `limit` (max 100). |
| GET | `/dashboard/sales-trend` | ADMIN, MANAGER | Daily sales trend (date, amount, invoiceCount). Params: `fromDate`, `toDate`. |
| GET | `/dashboard/cash-flow` | ADMIN, MANAGER | Inflows, outflows, net; by Cash/Bank account. Params: `fromDate`, `toDate`. |
| GET | `/dashboard/stock-alerts` | ADMIN, MANAGER, CASHIER | Products where current_stock < min_stock_level. |
| GET | `/dashboard/cash-credit-ratio` | ADMIN, MANAGER | Cash vs credit sales totals and ratios. Params: `fromDate`, `toDate`. |

---

## Roles

- **ADMIN:** Full access.
- **MANAGER:** Dashboard, reports, ledger, stock, master data.
- **CASHIER:** POS, customers, receipts; read-only products/units.

---

## Pagination

- Query params: `page` (0-based), `size`, `sort=field,asc|desc`.
- Response: Spring `Page` JSON (`content`, `totalElements`, `totalPages`, `number`, `size`).

---

## Swagger

- UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`
