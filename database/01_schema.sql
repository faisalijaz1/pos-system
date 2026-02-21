-- =============================================================================
-- Phase 1 — PostgreSQL Schema for Web-Based POS System
-- Munir Copy House / Urdu Bazar — Modernization
-- Auth: Simple database-level (no OAuth). Currency: PKR (single).
-- =============================================================================

-- Extensions (optional, for UUID if you prefer UUID PKs)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. ROLES & USERS (simple DB authentication)
-- -----------------------------------------------------------------------------
CREATE TABLE roles (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(200),
    role_id       INT NOT NULL REFERENCES roles(role_id),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);

-- -----------------------------------------------------------------------------
-- 2. LOOKUPS & BUSINESS INFO
-- -----------------------------------------------------------------------------
CREATE TABLE payment_methods (
    payment_method_id   SERIAL PRIMARY KEY,
    method_name         VARCHAR(100) NOT NULL UNIQUE,
    description         VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE delivery_modes (
    delivery_mode_id    SERIAL PRIMARY KEY,
    mode_name          VARCHAR(100) NOT NULL UNIQUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transaction_types (
    transaction_type_id SERIAL PRIMARY KEY,
    type_code           VARCHAR(50) NOT NULL UNIQUE,
    type_name           VARCHAR(100) NOT NULL,
    category            VARCHAR(50) NOT NULL, -- 'SALE' | 'STOCK' | 'LEDGER'
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE business_info (
    business_info_id SERIAL PRIMARY KEY,
    business_name    VARCHAR(200) NOT NULL,
    address          TEXT,
    phone            VARCHAR(50),
    email            VARCHAR(100),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Single row for business (enforce in app or trigger)
COMMENT ON TABLE business_info IS 'Single row: shop name, address, phone for receipts and reports';

-- -----------------------------------------------------------------------------
-- 2b. BRANCHES (optional, for multi-branch readiness)
-- -----------------------------------------------------------------------------
CREATE TABLE branches (
    branch_id   SERIAL PRIMARY KEY,
    branch_code VARCHAR(50) NOT NULL UNIQUE,
    branch_name VARCHAR(200) NOT NULL,
    address     TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_branches_code ON branches(branch_code);

-- -----------------------------------------------------------------------------
-- 3. CHART OF ACCOUNTS (for ledger and party balances)
-- -----------------------------------------------------------------------------
CREATE TABLE accounts (
    account_id     SERIAL PRIMARY KEY,
    account_code   VARCHAR(50) NOT NULL UNIQUE,
    account_name   VARCHAR(200) NOT NULL,
    account_type   VARCHAR(50) NOT NULL, -- 'Customer' | 'Supplier' | 'Cash' | 'Bank' | 'Revenue' | 'Expense' | 'Other'
    current_balance NUMERIC(18, 2) NOT NULL DEFAULT 0,
    balance_type   VARCHAR(2), -- 'Dr' | 'Cr' (denormalized for display)
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_code ON accounts(account_code);
CREATE INDEX idx_accounts_type ON accounts(account_type);

-- -----------------------------------------------------------------------------
-- 4. BANK / CASH ACCOUNTS (for Customer Receipt & Supplier Payment)
-- -----------------------------------------------------------------------------
CREATE TABLE bank_accounts (
    bank_account_id   SERIAL PRIMARY KEY,
    account_code      VARCHAR(50) NOT NULL UNIQUE,
    account_name      VARCHAR(200) NOT NULL,
    bank_name         VARCHAR(200), -- e.g. 'Meezan Bank'
    account_id        INT REFERENCES accounts(account_id), -- link to ledger account
    current_balance   NUMERIC(18, 2) NOT NULL DEFAULT 0,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bank_accounts_account_id ON bank_accounts(account_id);

-- -----------------------------------------------------------------------------
-- 5. CUSTOMERS (linked to accounts for ledger)
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
    customer_id    SERIAL PRIMARY KEY,
    account_id     INT NOT NULL REFERENCES accounts(account_id),
    customer_code  VARCHAR(50) UNIQUE,
    name           VARCHAR(200) NOT NULL,
    name_english   VARCHAR(200),
    contact_person VARCHAR(200),
    mobile         VARCHAR(50),
    address        TEXT,
    city           VARCHAR(100),
    phone          VARCHAR(50),
    fax            VARCHAR(50),
    email          VARCHAR(100),
    goods_company  VARCHAR(200),
    reference      VARCHAR(200),
    credit_limit   NUMERIC(18, 2) NOT NULL DEFAULT 0,
    joining_date   DATE DEFAULT CURRENT_DATE,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at     TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_customers_account ON customers(account_id);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_city ON customers(city);
CREATE INDEX idx_customers_mobile ON customers(mobile);
CREATE INDEX idx_customers_code ON customers(customer_code);

-- -----------------------------------------------------------------------------
-- 6. SUPPLIERS (linked to accounts for ledger)
-- -----------------------------------------------------------------------------
CREATE TABLE suppliers (
    supplier_id    SERIAL PRIMARY KEY,
    account_id     INT NOT NULL REFERENCES accounts(account_id),
    supplier_code  VARCHAR(50) UNIQUE,
    name           VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200),
    mobile         VARCHAR(50),
    address        TEXT,
    city           VARCHAR(100),
    phone          VARCHAR(50),
    fax            VARCHAR(50),
    email          VARCHAR(100),
    reference      VARCHAR(200),
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at     TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_suppliers_account ON suppliers(account_id);
CREATE INDEX idx_suppliers_name ON suppliers(name);

-- -----------------------------------------------------------------------------
-- 7. PRODUCT MASTERS (brands, categories, UOM)
-- -----------------------------------------------------------------------------
CREATE TABLE brands (
    brand_id   SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE units_of_measure (
    uom_id   SERIAL PRIMARY KEY,
    name     VARCHAR(50) NOT NULL UNIQUE,
    symbol  VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    product_id      SERIAL PRIMARY KEY,
    code            VARCHAR(50) NOT NULL UNIQUE,
    name_en         VARCHAR(300) NOT NULL,
    name_ur         VARCHAR(300),
    brand_id        INT REFERENCES brands(brand_id),
    category_id     INT REFERENCES categories(category_id),
    title           VARCHAR(200),
    description     TEXT,
    uom_id          INT NOT NULL REFERENCES units_of_measure(uom_id),
    min_stock_level INT NOT NULL DEFAULT 0,
    cost_price      NUMERIC(18, 2) NOT NULL DEFAULT 0,
    selling_price   NUMERIC(18, 2) NOT NULL DEFAULT 0,
    current_stock   NUMERIC(18, 4) NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name_en ON products(name_en);
CREATE INDEX idx_products_name_ur ON products(name_ur);
CREATE INDEX idx_products_current_stock ON products(current_stock);

-- -----------------------------------------------------------------------------
-- 8. SALES (POS) — Invoices & Items
-- -----------------------------------------------------------------------------
CREATE TABLE sales_invoices (
    sales_invoice_id   SERIAL PRIMARY KEY,
    invoice_number     VARCHAR(50) NOT NULL UNIQUE,
    branch_id          INT REFERENCES branches(branch_id),
    customer_id        INT REFERENCES customers(customer_id),
    user_id            INT NOT NULL REFERENCES users(user_id),
    invoice_date       DATE NOT NULL,
    invoice_time       TIME,
    transaction_type_id INT NOT NULL REFERENCES transaction_types(transaction_type_id),
    delivery_mode_id   INT REFERENCES delivery_modes(delivery_mode_id),
    is_cash_customer   BOOLEAN NOT NULL DEFAULT FALSE,
    grand_total        NUMERIC(18, 2) NOT NULL DEFAULT 0,
    additional_discount NUMERIC(18, 2) NOT NULL DEFAULT 0,
    additional_expenses NUMERIC(18, 2) NOT NULL DEFAULT 0,
    net_total          NUMERIC(18, 2) NOT NULL DEFAULT 0,
    amount_received    NUMERIC(18, 2) NOT NULL DEFAULT 0,
    remarks            TEXT,
    billing_no         VARCHAR(100),
    billing_date       DATE,
    billing_packing    VARCHAR(100),
    billing_adda       VARCHAR(200),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_invoices_number ON sales_invoices(invoice_number);
CREATE INDEX idx_sales_invoices_customer ON sales_invoices(customer_id);
CREATE INDEX idx_sales_invoices_date ON sales_invoices(invoice_date);
CREATE INDEX idx_sales_invoices_user ON sales_invoices(user_id);
CREATE INDEX idx_sales_invoices_date_customer ON sales_invoices(invoice_date, customer_id);

CREATE TABLE sales_invoice_items (
    sales_invoice_item_id SERIAL PRIMARY KEY,
    sales_invoice_id      INT NOT NULL REFERENCES sales_invoices(sales_invoice_id) ON DELETE CASCADE,
    product_id            INT NOT NULL REFERENCES products(product_id),
    quantity              NUMERIC(18, 4) NOT NULL,
    unit_price            NUMERIC(18, 2) NOT NULL,
    line_total            NUMERIC(18, 2) NOT NULL,
    uom_id                INT REFERENCES units_of_measure(uom_id),
    sort_order            INT DEFAULT 0,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_invoice_items_invoice ON sales_invoice_items(sales_invoice_id);
CREATE INDEX idx_sales_invoice_items_product ON sales_invoice_items(product_id);

-- -----------------------------------------------------------------------------
-- 9. STOCK TRANSACTIONS (Stock In / Stock Out)
-- -----------------------------------------------------------------------------
CREATE TABLE stock_transactions (
    stock_transaction_id   SERIAL PRIMARY KEY,
    record_no              VARCHAR(50) NOT NULL UNIQUE,
    branch_id              INT REFERENCES branches(branch_id),
    transaction_date       DATE NOT NULL,
    transaction_type_id   INT NOT NULL REFERENCES transaction_types(transaction_type_id),
    description            VARCHAR(500),
    user_id                INT REFERENCES users(user_id),
    ref_sales_invoice_id   INT REFERENCES sales_invoices(sales_invoice_id),
    ref_purchase_order_id  INT, -- FK added after purchase_orders exists
    created_at             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_transactions_date ON stock_transactions(transaction_date);
CREATE INDEX idx_stock_transactions_type ON stock_transactions(transaction_type_id);
CREATE INDEX idx_stock_transactions_record ON stock_transactions(record_no);

CREATE TABLE stock_transaction_items (
    stock_transaction_item_id SERIAL PRIMARY KEY,
    stock_transaction_id      INT NOT NULL REFERENCES stock_transactions(stock_transaction_id) ON DELETE CASCADE,
    product_id                INT NOT NULL REFERENCES products(product_id),
    quantity_change           NUMERIC(18, 4) NOT NULL, -- + for in, - for out
    price_at_transaction      NUMERIC(18, 2),
    created_at                TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_transaction_items_txn ON stock_transaction_items(stock_transaction_id);
CREATE INDEX idx_stock_transaction_items_product ON stock_transaction_items(product_id);

-- -----------------------------------------------------------------------------
-- 10. PURCHASE ORDERS (header + items)
-- -----------------------------------------------------------------------------
CREATE TABLE purchase_orders (
    purchase_order_id   SERIAL PRIMARY KEY,
    order_number        VARCHAR(50) NOT NULL UNIQUE,
    supplier_id         INT NOT NULL REFERENCES suppliers(supplier_id),
    user_id             INT REFERENCES users(user_id),
    order_date          DATE NOT NULL,
    total_amount        NUMERIC(18, 2) NOT NULL DEFAULT 0,
    status              VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT | CONFIRMED | RECEIVED
    remarks             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_date ON purchase_orders(order_date);

CREATE TABLE purchase_order_items (
    purchase_order_item_id SERIAL PRIMARY KEY,
    purchase_order_id      INT NOT NULL REFERENCES purchase_orders(purchase_order_id) ON DELETE CASCADE,
    product_id             INT NOT NULL REFERENCES products(product_id),
    quantity               NUMERIC(18, 4) NOT NULL,
    unit_price             NUMERIC(18, 2) NOT NULL,
    line_total             NUMERIC(18, 2) NOT NULL,
    uom_id                 INT REFERENCES units_of_measure(uom_id),
    sort_order             INT DEFAULT 0,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchase_order_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_product ON purchase_order_items(product_id);

-- Add FK from stock_transactions to purchase_orders
ALTER TABLE stock_transactions
    ADD CONSTRAINT fk_stock_transactions_ref_purchase
    FOREIGN KEY (ref_purchase_order_id) REFERENCES purchase_orders(purchase_order_id);

-- -----------------------------------------------------------------------------
-- 11. LEDGER ENTRIES (double-entry style, one row per line)
-- -----------------------------------------------------------------------------
CREATE TABLE ledger_entries (
    ledger_entry_id   SERIAL PRIMARY KEY,
    voucher_no        VARCHAR(50) NOT NULL,
    account_id        INT NOT NULL REFERENCES accounts(account_id),
    transaction_date  DATE NOT NULL,
    description       VARCHAR(500),
    debit_amount      NUMERIC(18, 2) NOT NULL DEFAULT 0,
    credit_amount     NUMERIC(18, 2) NOT NULL DEFAULT 0,
    ref_type          VARCHAR(50), -- 'SALE' | 'CUSTOMER_RECEIPT' | 'SUPPLIER_PAYMENT' | 'PURCHASE' | 'STOCK' | etc.
    ref_id            BIGINT,
    created_by        INT REFERENCES users(user_id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ledger_entries_account_date ON ledger_entries(account_id, transaction_date);
CREATE INDEX idx_ledger_entries_date_account ON ledger_entries(transaction_date, account_id);
CREATE INDEX idx_ledger_entries_voucher ON ledger_entries(voucher_no);
CREATE INDEX idx_ledger_entries_ref ON ledger_entries(ref_type, ref_id);
CREATE INDEX idx_ledger_entries_date ON ledger_entries(transaction_date);

-- -----------------------------------------------------------------------------
-- 12. CUSTOMER RECEIPTS (payment received from customer)
-- -----------------------------------------------------------------------------
CREATE TABLE customer_receipts (
    customer_receipt_id SERIAL PRIMARY KEY,
    receipt_number     VARCHAR(50) NOT NULL UNIQUE,
    branch_id          INT REFERENCES branches(branch_id),
    receipt_date       DATE NOT NULL,
    customer_id        INT NOT NULL REFERENCES customers(customer_id),
    bank_account_id    INT NOT NULL REFERENCES bank_accounts(bank_account_id),
    amount             NUMERIC(18, 2) NOT NULL,
    description        VARCHAR(500),
    payment_method_id  INT REFERENCES payment_methods(payment_method_id),
    user_id            INT REFERENCES users(user_id),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customer_receipts_number ON customer_receipts(receipt_number);
CREATE INDEX idx_customer_receipts_customer ON customer_receipts(customer_id);
CREATE INDEX idx_customer_receipts_date ON customer_receipts(receipt_date);

-- -----------------------------------------------------------------------------
-- 13. SUPPLIER PAYMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE supplier_payments (
    supplier_payment_id SERIAL PRIMARY KEY,
    voucher_no          VARCHAR(50) NOT NULL,
    branch_id           INT REFERENCES branches(branch_id),
    payment_date        DATE NOT NULL,
    supplier_id         INT NOT NULL REFERENCES suppliers(supplier_id),
    bank_account_id     INT NOT NULL REFERENCES bank_accounts(bank_account_id),
    amount              NUMERIC(18, 2) NOT NULL,
    description         VARCHAR(500),
    payment_method_id   INT REFERENCES payment_methods(payment_method_id),
    user_id             INT REFERENCES users(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supplier_payments_supplier ON supplier_payments(supplier_id);
CREATE INDEX idx_supplier_payments_date ON supplier_payments(payment_date);

-- -----------------------------------------------------------------------------
-- 14. AUDIT LOG
-- -----------------------------------------------------------------------------
CREATE TABLE audit_log (
    audit_log_id  SERIAL PRIMARY KEY,
    user_id       INT REFERENCES users(user_id),
    action        VARCHAR(100) NOT NULL,
    entity_type   VARCHAR(100),
    entity_id     BIGINT,
    details       JSONB,
    ip_address    VARCHAR(45),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);

-- -----------------------------------------------------------------------------
-- Optional: view for running balance per account (for reporting)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_ledger_running_balance AS
SELECT
    ledger_entry_id,
    voucher_no,
    account_id,
    transaction_date,
    description,
    debit_amount,
    credit_amount,
    ref_type,
    ref_id,
    SUM(debit_amount - credit_amount) OVER (
        PARTITION BY account_id
        ORDER BY transaction_date, ledger_entry_id
        ROWS UNBOUNDED PRECEDING
    ) AS running_balance,
    CASE
        WHEN SUM(debit_amount - credit_amount) OVER (
            PARTITION BY account_id
            ORDER BY transaction_date, ledger_entry_id
            ROWS UNBOUNDED PRECEDING
        ) >= 0 THEN 'Dr'
        ELSE 'Cr'
    END AS balance_type
FROM ledger_entries;

COMMENT ON VIEW v_ledger_running_balance IS 'Running balance per ledger entry for account ledger reports';
