-- =============================================================================
-- Demo users: Manager and Cashier (same password as admin for demo: change_me)
-- Run after 02_seed_data.sql. Idempotent: use ON CONFLICT or check before insert.
-- Password hash is copied from admin so it always matches admin's current password.
-- =============================================================================
INSERT INTO users (username, password_hash, full_name, role_id)
SELECT 'manager', (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1), 'Store Manager', role_id FROM roles WHERE role_name = 'Manager' LIMIT 1
ON CONFLICT (username) DO UPDATE SET password_hash = (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1);

INSERT INTO users (username, password_hash, full_name, role_id)
SELECT 'cashier', (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1), 'POS Cashier', role_id FROM roles WHERE role_name = 'Cashier' LIMIT 1
ON CONFLICT (username) DO UPDATE SET password_hash = (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1);
