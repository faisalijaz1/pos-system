-- =============================================================================
-- Migration: Payment Ledger & POS Cash Account
-- Ensures Amount Received generates ledger entries (Dr Cash, Cr Customer) and
-- a POS Cash account exists. Idempotent; safe to run multiple times.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. POS Cash account (for Dr on payment received)
-- -----------------------------------------------------------------------------
INSERT INTO accounts (account_code, account_name, account_type, current_balance, balance_type, is_active, created_at, updated_at)
SELECT 'POS-CASH', 'POS Cash', 'Cash', 0, 'Dr', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account_code = 'POS-CASH');

-- If you prefer a generic Cash account used elsewhere:
-- INSERT INTO accounts (account_code, account_name, account_type, current_balance, balance_type, is_active, created_at, updated_at)
-- SELECT 'CASH001', 'Cash', 'Cash', 0, 'Dr', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
-- WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account_code = 'CASH001');

-- -----------------------------------------------------------------------------
-- 2. Ledger ref_type: PAYMENT is used by application (no schema change needed)
--    ref_type in ledger_entries is VARCHAR(50); 'PAYMENT' is valid.
-- -----------------------------------------------------------------------------
COMMENT ON COLUMN ledger_entries.ref_type IS 'SALE=invoice sale, PAYMENT=amount received against invoice, CUSTOMER_RECEIPT, SUPPLIER_PAYMENT, etc.';

-- -----------------------------------------------------------------------------
-- 3. Optional: index for finding payment entries by invoice (if not already fast)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ledger_entries_ref_type_ref_id
ON ledger_entries(ref_type, ref_id)
WHERE ref_type IS NOT NULL AND ref_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 4. Ensure sales_invoices has change_returned (if 04_migration ran)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sales_invoices' AND column_name = 'change_returned'
  ) THEN
    ALTER TABLE sales_invoices ADD COLUMN change_returned NUMERIC(18,2) NOT NULL DEFAULT 0;
  END IF;
END $$;
