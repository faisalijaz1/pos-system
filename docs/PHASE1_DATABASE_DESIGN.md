# Phase 1 — Database Architecture & Schema Design

## Web-Based POS System (Munir Copy House — Modernization)

**Stack:** PostgreSQL · Spring Boot REST · ReactJS · Docker  
**Auth:** Simple database-level authentication (no OAuth).  
**Reference:** Existing desktop POS screenshots (customers, products, sale invoice, stock record, customer receipt, accounts ledger, customer ledger).

---

## 1. Design Principles

- **Normalized core:** Master data (customers, products, accounts) in normalized tables; transactional data in clear header/detail patterns.
- **Ledger as source of truth:** Customer/supplier balances derived from ledger entries; optional cached balance on account/customer for performance.
- **Audit-ready:** `created_at`, `updated_at`, `created_by` where relevant; dedicated `audit_log` for sensitive actions.
- **Reporting-friendly:** Indexes and (where needed) summary tables/views for dashboard, daily/monthly/yearly sales, and exports (PDF/Excel).
- **Multi-language:** Product and customer names support English and Urdu where required by existing UI.

---

## 2. Entity Relationship — Logical Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CORE / MASTER DATA                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│  roles ──< users                                                                  │
│  cities (optional)                                                               │
│  brands ──< products >── categories                                               │
│  products ──< units_of_measure                                                    │
│  payment_methods    delivery_modes    transaction_types (lookups)                │
│  business_info (single row: name, address, phone)                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  PARTIES & ACCOUNTING                                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│  accounts (chart of accounts: type = Customer | Supplier | Cash | Bank | ...)     │
│  customers ── account_id (FK) ──> accounts                                        │
│  suppliers ── account_id (FK) ──> accounts                                        │
│  bank_accounts (cash/bank for receipts & payments)                                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  SALES (POS)                                                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│  sales_invoices (header: invoice_no, customer_id, user_id, date, time,          │
│                  grand_total, discount, expenses, net_total, amount_received,    │
│                  transaction_type, delivery_mode_id, remarks, billing_*)         │
│  sales_invoice_items (line: product_id, qty, unit_price, line_total, uom_id)    │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  INVENTORY / STOCK                                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│  stock_transactions (header: record_no, transaction_date, transaction_type_id, │
│                     description, user_id, ref_invoice_id nullable)               │
│  stock_transaction_items (product_id, quantity_change, price_at_transaction)      │
│  products.current_stock (denormalized for quick display; maintained by logic)   │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  PURCHASES & SUPPLIERS                                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│  purchase_orders (header)                                                        │
│  purchase_order_items (detail)                                                   │
│  supplier_payments (receipt_no, supplier_id, bank_account_id, amount, date)      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  LEDGER & PAYMENTS                                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ledger_entries (voucher_no, account_id, transaction_date, description,           │
│                 debit_amount, credit_amount, ref_type, ref_id, created_by)       │
│  customer_receipts (receipt_no, customer_id, account_id [cash/bank], amount,     │
│                     receipt_date, description) → posts to ledger_entries          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  REPORTING & AUDIT                                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│  audit_log (user_id, action, entity_type, entity_id, details, created_at)        │
│  (Optional) daily_sales_summary, monthly_sales_summary for dashboard              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Table Definitions & Justification

### 3.1 Authentication & Users

| Table        | Purpose |
|-------------|---------|
| **roles**   | Admin, Cashier, Manager — for role-based access. |
| **users**   | Simple DB auth: username, password_hash, role_id. No OAuth. |

- `users` references `roles`. Index on `username` (unique) for login lookup.

---

### 3.2 Lookups & Business Info

| Table               | Purpose |
|---------------------|---------|
| **payment_methods** | Cash, Cheque, Bank Transfer, Online (e.g. "ONLINE MZ"), etc. |
| **delivery_modes**  | Counter, Delivery — as in Sale Invoice. |
| **transaction_types** | Sale, Return (invoice); Stock In, Stock Out (stock). |
| **business_info**   | Single row: business name, address, phone (for receipts/prints). |

---

### 3.3 Products & Inventory Structure

| Table                | Purpose |
|----------------------|---------|
| **brands**           | GM, Mayoor, Munir, etc. — from Product Information. |
| **categories**       | Product categories — from Product Information. |
| **units_of_measure** | Pcs, Dozen, Gurus, Kg, Ream, etc. |
| **products**         | code (unique), name_en, name_ur, brand_id, category_id, description, title, uom_id, min_stock_level, cost_price, selling_price (original_price), current_stock. `current_stock` can go negative if business allows (as in existing screens). |

- **sales_invoice_items** and **stock_transaction_items** reference `products` and optionally `units_of_measure` for line-level unit.

---

### 3.4 Parties & Accounts (Ledger-Ready)

- **accounts** — Chart of accounts: `account_code` (e.g. 2030058), `account_name`, `account_type` (Customer, Supplier, Cash, Bank, Revenue, Expense, etc.). Used for ledger report “A/C Code” and “Account Name”.
- **customers** — customer_id, name (and name_english if needed), contact_person, mobile, address, city, phone, fax, email, goods_company, reference, credit_limit, joining_date, **account_id** (FK to accounts), is_active. Balance shown in UI = sum of ledger entries for that account or cached in `accounts`/view.
- **suppliers** — Same idea: supplier_id, name, contact details, **account_id** (FK to accounts).
- **bank_accounts** — Cash/Bank accounts for “Customer Receipt” (Cash/Bank, Bank Name, Balance). Used when recording customer receipts and supplier payments.

This matches the existing “Accounts Ledger Report” (A/C Code, Account Name, Balance, Receivable) and “Customer Receipt” (Cash/Bank, Bank Name, Balance).

---

### 3.5 Sales (POS) Schema

- **sales_invoices**  
  - invoice_number (unique, business-facing), customer_id (nullable for cash customer), user_id (cashier), invoice_date, invoice_time, transaction_type_id (Sale/Return), delivery_mode_id, grand_total, additional_discount, additional_expenses, net_total, amount_received, is_cash_customer, remarks, billing_no, billing_date, billing_packing, billing_adda.

- **sales_invoice_items**  
  - invoice_id (FK), product_id, quantity, unit_price, line_total, uom_id (optional).

Each sale can post to **ledger_entries** (debit customer account) and **stock_transaction_items** (stock out); customer receipt posts credit to customer account and debit to cash/bank.

---

### 3.6 Stock / Inventory

- **stock_transactions** — record_no (unique), transaction_date, transaction_type_id (Stock In / Stock Out), description (e.g. “Aamir Dt”), user_id, ref_invoice_id (nullable, e.g. link to purchase or sale if applicable).
- **stock_transaction_items** — transaction_id, product_id, quantity_change (+ or -), price_at_transaction.

`products.current_stock` is updated by application logic when recording stock in/out or sales; schema allows negative stock if business rules permit.

---

### 3.7 Purchases & Supplier Payments

- **purchase_orders** — header: supplier_id, order_date, total, status, etc.
- **purchase_order_items** — product_id, quantity, unit_price, line_total.
- **supplier_payments** — supplier_id, bank_account_id, amount, payment_date, voucher_no, description. Posts to ledger (credit supplier account, debit bank).

---

### 3.8 Ledger & Accounting

- **ledger_entries**  
  - id (PK), voucher_no (business-facing, e.g. for “Vch #”), account_id (FK), transaction_date, description (e.g. “Sale, Invoice # 33560”, “ONLINE MZ”), debit_amount, credit_amount, ref_type (e.g. 'SALE', 'CUSTOMER_RECEIPT', 'SUPPLIER_PAYMENT'), ref_id (e.g. sales_invoice_id or customer_receipt_id), created_by, created_at.

Running balance in “Customer Ledger” is computed by ordering by date and voucher and summing (debit - credit) over account_id. Optionally store running_balance in a separate table or materialized view for heavy reporting.

- **customer_receipts**  
  - receipt_id, receipt_number (unique), receipt_date, customer_id, bank_account_id (Cash/Bank), amount, description, user_id, created_at. Each receipt generates one or two ledger_entries (e.g. debit Cash/Bank, credit Customer account).

---

### 3.9 Audit & Reporting

- **audit_log** — user_id, action (e.g. CREATE_SALE, UPDATE_PRODUCT), entity_type, entity_id, details (JSON or text), created_at. Index on (entity_type, entity_id) and (created_at) for reporting.

Reporting optimization:
- Indexes on (invoice_date), (customer_id, invoice_date), (product_id, invoice_date) for sales reports.
- Indexes on (account_id, transaction_date) for ledger reports.
- Optional: **daily_sales_summary** / **monthly_sales_summary** tables populated by batch or triggers for dashboard KPIs (daily/monthly totals, best sellers, top customers). Can be added in Phase 2 when implementing dashboard APIs.

---

## 4. Indexing Strategy

| Area | Indexes | Reason |
|------|---------|--------|
| **users** | UNIQUE(username) | Login lookup |
| **products** | UNIQUE(code), (brand_id), (category_id), (name_en), (name_ur) | Search, filters, POS |
| **customers** | (account_id), (name), (city), (mobile) | Ledger report, customer list, receipt |
| **suppliers** | (account_id), (name) | Same pattern |
| **accounts** | UNIQUE(account_code), (account_type) | Ledger report, account type filter |
| **sales_invoices** | UNIQUE(invoice_number), (customer_id), (invoice_date), (user_id) | Daily/monthly/yearly sales, customer history |
| **sales_invoice_items** | (invoice_id), (product_id) | Invoice lines, product sales |
| **ledger_entries** | (account_id, transaction_date), (voucher_no), (ref_type, ref_id) | Ledger report by account and date range |
| **stock_transactions** | (transaction_date), (transaction_type_id) | Stock reports |
| **stock_transaction_items** | (transaction_id), (product_id) | Movement by product |
| **customer_receipts** | UNIQUE(receipt_number), (customer_id), (receipt_date) | Receipt lookup, customer payments |
| **audit_log** | (user_id), (entity_type, entity_id), (created_at) | Audit trails |

---

## 5. Ledger & Accounting Schema (Double-Entry Style)

- Every financial event (sale on credit, customer receipt, supplier payment) creates one or more **ledger_entries** with **account_id**, **debit_amount**, **credit_amount**.
- Customer and supplier balances = sum of (debit - credit) for their **account_id** up to a given date.
- **accounts** table holds both “party” accounts (one per customer/supplier) and “general” accounts (Cash, Bank, Revenue, etc.). Customer Receipt: Debit Cash/Bank account, Credit Customer account. Sale on credit: Debit Customer account, Credit Sales/Revenue (if you model revenue account).
- **voucher_no** and **transaction_date** support “Customer Ledger” and “Accounts Ledger Report” with date range and account selection. Running balance computed in query or cached.

---

## 6. POS Transaction Schema Summary

- **sales_invoices** = one billing document (with optional cash customer flag).
- **sales_invoice_items** = line items (product, qty, price, total).
- On confirm sale: insert invoice + items; optionally create ledger entry (debit customer); create stock out transaction (or reduce `products.current_stock` and optionally log in stock_transaction_items).
- **customer_receipts** = payment received; posts to ledger (credit customer, debit bank/cash).
- **supplier_payments** = payment to supplier; posts to ledger (debit supplier account, credit bank).

---

## 7. Reporting Optimization

- **Daily/monthly/yearly sales:** Aggregate from **sales_invoices** (and **sales_invoice_items** for product-level) with indexes on **invoice_date**.
- **Best-selling products:** Join **sales_invoice_items** with **products**, group by product_id, sum quantity/line_total; index (product_id, invoice_id) and invoice_date via join.
- **Top customers:** Sum net_total or amount_received from **sales_invoices** grouped by customer_id; index (customer_id, invoice_date).
- **Profit & loss:** Revenue from sales; cost from cost_price in **sales_invoice_items** or **products**; ledger can also feed P&L if you use revenue/expense accounts.
- **Stock alerts:** Filter **products** where current_stock &lt; min_stock_level (index on min_stock_level if needed).
- **Cash flow:** Ledger entries for Cash/Bank accounts over date range.
- **Ledger report by account and date range:** Filter **ledger_entries** by account_id and transaction_date between From/To; order by date, voucher_no; compute running balance in query or view.
- **Export (PDF/Excel):** Backend reads same tables/views; no extra schema required beyond indexes for speed.

---

## 8. Assumptions & Notes

- **Negative stock:** Allowed if business practice matches existing system (e.g. backorders or delayed stock entry).
- **Currency:** Single currency (e.g. PKR); no currency column in schema. Can add later if needed.
- **Multi-branch:** Schema is single-branch; branch_id can be added to relevant tables later if required.
- **Running balance:** Computed in application/views for correctness; optional snapshot table for performance.
- **Simple auth:** Passwords stored hashed (e.g. BCrypt); no OAuth/JWT schema in DB (tokens can be stateless in app).

---

## 9. Next Steps

1. **Review & approve** this Phase 1 design (tables, relationships, indexes).
2. **Implement** the DDL scripts (create tables, FKs, indexes) and optional seed data for roles, payment_methods, delivery_modes, transaction_types, business_info.
3. After approval, proceed to **Phase 2:** Spring Boot REST APIs (modular, layered, auth, POS, ledger, reporting, dashboard APIs).

---

## 10. Phase 1 Refinements (Applied)

- **Soft delete:** `deleted_at TIMESTAMPTZ` (nullable) added on `users`, `customers`, `suppliers`, `products`. Queries filter `deleted_at IS NULL` for active records.
- **Branch readiness:** `branches` table added; optional `branch_id` (FK) on `sales_invoices`, `stock_transactions`, `customer_receipts`, `supplier_payments`. Unused for single-branch; ready for multi-branch later.
- **Ledger performance:** Composite index `(transaction_date, account_id)` on `ledger_entries` for date-range ledger reporting.

For existing DBs that already ran the original schema, run `database/03_phase1_refinements.sql`.

---

*Document version: 1.1 — Phase 1 Database Design (with refinements)*
