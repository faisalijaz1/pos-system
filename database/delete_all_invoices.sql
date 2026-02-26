-- =============================================================================
-- DELETE ALL INVOICES — Start from scratch
-- Removes all sales invoices, their items, related ledger entries (SALE/PAYMENT),
-- and unlinks stock transactions. Run only when you want to clear invoice data.
-- PostgreSQL compatible. Use a transaction so you can ROLLBACK if needed.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Delete ledger entries for sales and payments (so ledger matches no invoices)
-- -----------------------------------------------------------------------------
DELETE FROM ledger_entries
WHERE ref_type IN ('SALE', 'PAYMENT');

-- -----------------------------------------------------------------------------
-- 2. Unlink stock transactions from sales invoices (required before deleting invoices)
-- -----------------------------------------------------------------------------
UPDATE stock_transactions
SET ref_sales_invoice_id = NULL
WHERE ref_sales_invoice_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 3. Delete all sales invoices (CASCADE deletes sales_invoice_items)
-- -----------------------------------------------------------------------------
DELETE FROM sales_invoices;

-- -----------------------------------------------------------------------------
-- Optional: Reset denormalized account balances for Customer, Revenue, Cash
--    so "Prev balance" and ledger reports start from zero. Uncomment if needed.
-- -----------------------------------------------------------------------------
-- UPDATE accounts
-- SET current_balance = 0, balance_type = NULL
-- WHERE account_type IN ('Customer', 'Revenue', 'Cash');

COMMIT;

-- To undo before committing, run: ROLLBACK;
