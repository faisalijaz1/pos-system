-- =============================================================================
-- Phase 1 Refinements — For existing databases that already ran 01_schema.sql
-- Run once. New installs use 01_schema.sql which already includes these.
-- =============================================================================

-- Soft delete
ALTER TABLE users      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE customers  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE suppliers  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE products   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Branches (multi-branch readiness)
CREATE TABLE IF NOT EXISTS branches (
    branch_id   SERIAL PRIMARY KEY,
    branch_code VARCHAR(50) NOT NULL UNIQUE,
    branch_name VARCHAR(200) NOT NULL,
    address     TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(branch_code);

ALTER TABLE sales_invoices     ADD COLUMN IF NOT EXISTS branch_id INT REFERENCES branches(branch_id);
ALTER TABLE stock_transactions  ADD COLUMN IF NOT EXISTS branch_id INT REFERENCES branches(branch_id);
ALTER TABLE customer_receipts  ADD COLUMN IF NOT EXISTS branch_id INT REFERENCES branches(branch_id);
ALTER TABLE supplier_payments  ADD COLUMN IF NOT EXISTS branch_id INT REFERENCES branches(branch_id);

-- Ledger performance index
CREATE INDEX IF NOT EXISTS idx_ledger_entries_date_account ON ledger_entries(transaction_date, account_id);
