-- =============================================================================
-- Seed dummy customers for POS testing (add products/invoices against customers)
-- Run after 01_schema.sql and 02_seed_data.sql.
-- Each customer needs an account (account_type = 'Customer') for ledger/balance.
-- Safe to run multiple times (idempotent).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CUSTOMER ACCOUNTS (one per customer; current_balance = Prev Bal in POS)
-- -----------------------------------------------------------------------------
INSERT INTO accounts (account_code, account_name, account_type, current_balance) VALUES
('CUST001', 'Muslim Book Agency Tank', 'Customer', 108802),
('CUST002', 'Feroze Sons Traders', 'Customer', 25000),
('CUST003', 'Al-Hamd Stationery', 'Customer', 0),
('CUST004', 'Urdu Bazar Book House', 'Customer', 45000),
('CUST005', 'City Book Depot', 'Customer', 12500)
ON CONFLICT (account_code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- CUSTOMERS (linked to accounts above)
-- -----------------------------------------------------------------------------
INSERT INTO customers (account_id, customer_code, name, name_english, mobile, address, city, credit_limit)
VALUES
  ((SELECT account_id FROM accounts WHERE account_code = 'CUST001' LIMIT 1), 'C001', 'Muslim Book Agency Tank', 'Muslim Book Agency Tank', '0300-1234567', 'Tank Road, Lahore', 'Lahore', 200000),
  ((SELECT account_id FROM accounts WHERE account_code = 'CUST002' LIMIT 1), 'C002', 'Feroze Sons Traders', 'Feroze Sons Traders', '0321-9876543', 'Feroze Street, Urdu Bazar', 'Lahore', 100000),
  ((SELECT account_id FROM accounts WHERE account_code = 'CUST003' LIMIT 1), 'C003', 'Al-Hamd Stationery', 'Al-Hamd Stationery', '0333-5551234', 'Kabir Street', 'Lahore', 50000),
  ((SELECT account_id FROM accounts WHERE account_code = 'CUST004' LIMIT 1), 'C004', 'Urdu Bazar Book House', 'Urdu Bazar Book House', '042-37320001', 'Urdu Bazar', 'Lahore', 150000),
  ((SELECT account_id FROM accounts WHERE account_code = 'CUST005' LIMIT 1), 'C005', 'City Book Depot', 'City Book Depot', '0300-4825471', 'Main Boulevard', 'Lahore', 75000)
ON CONFLICT (customer_code) DO NOTHING;
