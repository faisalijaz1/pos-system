-- =============================================================================
-- Demo users: Manager and Cashier (same password as admin for demo: change_me)
-- Run after 02_seed_data.sql. Idempotent: use ON CONFLICT or check before insert.
-- =============================================================================
INSERT INTO users (username, password_hash, full_name, role_id)
SELECT 'manager', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Store Manager', role_id FROM roles WHERE role_name = 'Manager' LIMIT 1
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password_hash, full_name, role_id)
SELECT 'cashier', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'POS Cashier', role_id FROM roles WHERE role_name = 'Cashier' LIMIT 1
ON CONFLICT (username) DO NOTHING;
