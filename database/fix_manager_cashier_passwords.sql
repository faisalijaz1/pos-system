-- =============================================================================
-- Fix manager and cashier login: set their password_hash to match admin.
-- Run this if admin can log in with "change_me" but manager/cashier cannot.
-- After running, manager and cashier will have the same password as admin.
-- =============================================================================
UPDATE users
SET password_hash = (SELECT password_hash FROM users WHERE username = 'admin' LIMIT 1)
WHERE username IN ('manager', 'cashier');
