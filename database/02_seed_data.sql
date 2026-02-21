-- =============================================================================
-- Phase 1 — Seed / Lookup Data for Web-Based POS
-- Run after 01_schema.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ROLES
-- -----------------------------------------------------------------------------
INSERT INTO roles (role_name, description) VALUES
('Admin', 'Full system access'),
('Manager', 'Reports, management, override'),
('Cashier', 'POS, sales, receipts');

-- -----------------------------------------------------------------------------
-- PAYMENT METHODS (from screenshots: Cash, Cheque, Online MZ, etc.)
-- -----------------------------------------------------------------------------
INSERT INTO payment_methods (method_name, description) VALUES
('Cash', 'Cash payment'),
('Cheque', 'Cheque payment'),
('Bank Transfer', 'Bank transfer'),
('Online', 'Online payment (e.g. ONLINE MZ)'),
('Card', 'Card payment');

-- -----------------------------------------------------------------------------
-- DELIVERY MODES (Sale Invoice: Counter, Delivery)
-- -----------------------------------------------------------------------------
INSERT INTO delivery_modes (mode_name) VALUES
('Counter'),
('Delivery');

-- -----------------------------------------------------------------------------
-- TRANSACTION TYPES (Sale/Return for invoice; Stock In/Out for stock)
-- -----------------------------------------------------------------------------
INSERT INTO transaction_types (type_code, type_name, category) VALUES
('SALE', 'Sale', 'SALE'),
('RETURN', 'Return', 'SALE'),
('STOCK_IN', 'Stock In', 'STOCK'),
('STOCK_OUT', 'Stock Out', 'STOCK');

-- -----------------------------------------------------------------------------
-- SALES REVENUE ACCOUNT (for ledger Cr on sales)
-- -----------------------------------------------------------------------------
INSERT INTO accounts (account_code, account_name, account_type) VALUES
('REV001', 'Sales Revenue', 'Revenue');

-- -----------------------------------------------------------------------------
-- INVENTORY ACCOUNT (for ledger Dr on purchases)
-- -----------------------------------------------------------------------------
INSERT INTO accounts (account_code, account_name, account_type) VALUES
('INV001', 'Inventory', 'Inventory');

-- -----------------------------------------------------------------------------
-- BUSINESS INFO (single row — Munir Copy House / Urdu Bazar)
-- -----------------------------------------------------------------------------
INSERT INTO business_info (business_name, address, phone) VALUES
('MUNIR COPY HOUSE', 'Kabir Street, Urdu Bazar, Lahore.', 'Ph: 042-37321351');

-- -----------------------------------------------------------------------------
-- DEFAULT ADMIN USER (password: change_me — must be changed in production)
-- BCrypt hash for 'change_me' (cost 10)
-- -----------------------------------------------------------------------------
INSERT INTO users (username, password_hash, full_name, role_id) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin', (SELECT role_id FROM roles WHERE role_name = 'Admin'));

-- -----------------------------------------------------------------------------
-- SAMPLE UNITS OF MEASURE (from screenshots: Pcs, Dozen, Gurus, etc.)
-- -----------------------------------------------------------------------------
INSERT INTO units_of_measure (name, symbol) VALUES
('Pcs', 'pcs'),
('Dozen', 'doz'),
('Gurus', 'gurus'),
('Kg', 'kg'),
('Ream', 'ream'),
('Packet', 'pkt'),
('Roll', 'roll'),
('Dasta', 'dasta'),
('Rim', 'rim');

-- -----------------------------------------------------------------------------
-- BRANDS (from desktop POS: Teetar, Munir)
-- -----------------------------------------------------------------------------
INSERT INTO brands (name) VALUES
('Teetar'),
('Munir'),
('Rang Register');

-- -----------------------------------------------------------------------------
-- CATEGORIES (from desktop POS: Card Register, Ring Register)
-- -----------------------------------------------------------------------------
INSERT INTO categories (name) VALUES
('Card Register'),
('Ring Register'),
('Stationery');

-- -----------------------------------------------------------------------------
-- SAMPLE PRODUCTS (from desktop Sale Invoice: search by code/name "500")
-- -----------------------------------------------------------------------------
INSERT INTO products (code, name_en, name_ur, brand_id, category_id, uom_id, min_stock_level, cost_price, selling_price, current_stock) VALUES
('490', 'Register No 500 Broad Line', 'رجسٹر نمبر 500 براڈ لائن', (SELECT brand_id FROM brands WHERE name = 'Teetar' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Card Register' LIMIT 1), (SELECT uom_id FROM units_of_measure WHERE name = 'Dozen' LIMIT 1), 5, 2000, 2196, 5604),
('491', 'Register No 500 Narrow Line', 'رجسٹر نمبر 500 نیرو لائن', (SELECT brand_id FROM brands WHERE name = 'Teetar' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Card Register' LIMIT 1), (SELECT uom_id FROM units_of_measure WHERE name = 'Dozen' LIMIT 1), 5, 2000, 2196, 358),
('530', 'Ring Register No 500 Broad Line', 'رنگ رجسٹر نمبر 500 براڈ لائن', (SELECT brand_id FROM brands WHERE name = 'Rang Register' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Ring Register' LIMIT 1), (SELECT uom_id FROM units_of_measure WHERE name = 'Dozen' LIMIT 1), 5, 1800, 1980, 86),
('208', 'Copy No 200 4 Line Munir', 'کاپی نمبر 200 4 لائن منیر', (SELECT brand_id FROM brands WHERE name = 'Munir' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Stationery' LIMIT 1), (SELECT uom_id FROM units_of_measure WHERE name = 'Dozen' LIMIT 1), 5, 550, 624, 1200),
('403', 'Register No 500 Khilarol', 'رجسٹر نمبر 500 كهلارول', (SELECT brand_id FROM brands WHERE name = 'Munir' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Card Register' LIMIT 1), (SELECT uom_id FROM units_of_measure WHERE name = 'Dozen' LIMIT 1), 5, 2000, 2196, 5604);

-- Optional: one sample account + customer for testing (comment out if not needed)
-- INSERT INTO accounts (account_code, account_name, account_type) VALUES
-- ('CASH001', 'Cash', 'Cash'),
-- ('2030001', 'Sample Customer Account', 'Customer');
-- INSERT INTO customers (account_id, customer_code, name, name_english) VALUES
-- ((SELECT account_id FROM accounts WHERE account_code = '2030001'), 'C001', 'Sample Customer', 'Sample Customer');
