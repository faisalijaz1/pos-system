-- =============================================================================
-- POS Billing Upgrades — Production-safe migration
-- Run after 01_schema.sql, 02_seed_data.sql (and 03_seed_products.sql if used).
-- Safe to run on existing DB: uses ADD COLUMN IF NOT EXISTS where supported,
-- or plain ADD COLUMN (run once).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SALES_INVOICES — Payment & print options
-- -----------------------------------------------------------------------------
ALTER TABLE sales_invoices
  ADD COLUMN IF NOT EXISTS change_returned NUMERIC(18, 2) NOT NULL DEFAULT 0;

ALTER TABLE sales_invoices
  ADD COLUMN IF NOT EXISTS print_without_header BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE sales_invoices
  ADD COLUMN IF NOT EXISTS print_without_balance BOOLEAN NOT NULL DEFAULT FALSE;

-- Invoice status: DRAFT (saved, no stock/ledger) | COMPLETED (full post)
ALTER TABLE sales_invoices
  ADD COLUMN IF NOT EXISTS invoice_status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED';

COMMENT ON COLUMN sales_invoices.change_returned IS 'Change returned to customer (cash)';
COMMENT ON COLUMN sales_invoices.print_without_header IS 'Print receipt without header';
COMMENT ON COLUMN sales_invoices.print_without_balance IS 'Print receipt without balance line';
COMMENT ON COLUMN sales_invoices.invoice_status IS 'DRAFT or COMPLETED';

-- Index for listing drafts
CREATE INDEX IF NOT EXISTS idx_sales_invoices_status ON sales_invoices(invoice_status);

-- -----------------------------------------------------------------------------
-- 2. TRANSACTION TYPES — Add Exchange (future-ready)
-- -----------------------------------------------------------------------------
INSERT INTO transaction_types (type_code, type_name, category)
SELECT 'EXCHANGE', 'Exchange', 'SALE'
WHERE NOT EXISTS (SELECT 1 FROM transaction_types WHERE type_code = 'EXCHANGE');

-- -----------------------------------------------------------------------------
-- 3. CUSTOMERS — Balance is on accounts.current_balance (no schema change)
--    Ensure API uses accounts.current_balance for customer balance.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- 4. STOCK_TRANSACTION_ITEMS — Unit of measure (optional)
-- -----------------------------------------------------------------------------
ALTER TABLE stock_transaction_items
  ADD COLUMN IF NOT EXISTS uom_id INTEGER NULL REFERENCES units_of_measure(uom_id);
COMMENT ON COLUMN stock_transaction_items.uom_id IS 'Unit of measure for the quantity (optional)';
