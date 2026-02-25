# Login Credentials — Web POS Application

**Important:** The **current desktop application has no login or role-based access**. Anyone with access to the desktop can do everything. The web application introduces **secure login and roles** (Admin, Manager, Cashier). Use the credentials below for testing and handover.

---

## Default Users (After Running Database Seeds)

After running the database schema and seed scripts (including `06_seed_demo_users.sql` for Manager and Cashier), the following accounts are available.

### 1. Administrator

| Field | Value |
|-------|--------|
| **Username** | `admin` |
| **Password** | `change_me` |
| **Role** | Admin |
| **Full name** | System Admin |
| **Access** | Full system (Dashboard, POS Billing, Products, Customers, Purchases, Stock, Ledger). Intended for user/role management when that module is added. |

---

### 2. Manager (Demo)

| Field | Value |
|-------|--------|
| **Username** | `manager` |
| **Password** | `change_me` |
| **Role** | Manager |
| **Full name** | Store Manager |
| **Access** | Dashboard, POS Billing, Products, Customers, Purchases, Stock, Ledger. No user/role management. |

**Note:** This user is created by running `database/06_seed_demo_users.sql` after `02_seed_data.sql`. If you have not run that script, only `admin` will exist.

---

### 3. Cashier (Demo)

| Field | Value |
|-------|--------|
| **Username** | `cashier` |
| **Password** | `change_me` |
| **Role** | Cashier |
| **Full name** | POS Cashier |
| **Access** | POS Billing, Products (read), Customers, Stock (read), Ledger. No Dashboard (if sidebar is configured that way), no Purchases. |

**Note:** This user is created by running `database/06_seed_demo_users.sql` after `02_seed_data.sql`.

---

## Summary Table

| Username | Password   | Role    | Seed script        |
|----------|------------|---------|--------------------|
| admin    | change_me  | Admin   | 02_seed_data.sql   |
| manager  | change_me  | Manager | 06_seed_demo_users.sql |
| cashier  | change_me  | Cashier | 06_seed_demo_users.sql |

---

## Security Notes

1. **Change default passwords** in production. The password `change_me` is for initial setup and demo only.
2. Passwords are stored as **BCrypt hashes** (cost 10) in the `users` table; never stored in plain text.
3. **JWT** is used for session; token is returned on `POST /api/v1/auth/login` and must be sent as `Authorization: Bearer <token>` on subsequent requests.
4. The **desktop application** does not have users or roles; the web application adds this for security and accountability.

---

## Adding More Users

- **Option A:** When a User Management screen is added to the web app, Admins can create users and assign roles from the UI.
- **Option B:** Insert directly into the database. Use a BCrypt hash for the password (e.g. generate with a tool or your backend). Example (after generating a hash for the desired password):

```sql
INSERT INTO users (username, password_hash, full_name, role_id)
VALUES (
  'newuser',
  '$2a$10$...',  -- BCrypt hash of the password
  'Full Name',
  (SELECT role_id FROM roles WHERE role_name = 'Cashier' LIMIT 1)
);
```

---

*Document: Login Credentials — Web POS*  
*Version: 1.0*
