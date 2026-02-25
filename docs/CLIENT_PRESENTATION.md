# Munir Copy House — Desktop to Web POS Migration
## Client Presentation

**Purpose:** Present the new web-based POS system, showcase migrated features and new capabilities, and position the web application as the preferred platform going forward.

---

## Slide 1: Title

**From Desktop to Web: Munir Copy House POS — Modern, Secure, Anywhere**

- Migration from legacy desktop application to a modern web application
- Same business logic, better experience, more control
- **One system. One source of truth. Access from anywhere.**

---

## Slide 2: Why Move to Web?

| Desktop (Current) | Web (New) |
|-------------------|-----------|
| Installed on one PC | Use from any device (PC, tablet, browser) |
| No user roles — anyone can do anything | **Role-based access** — Admin, Manager, Cashier |
| Updates require installing software | Updates once on server — everyone gets latest |
| Data on one machine | Data centralized, secure, back-up friendly |
| No built-in analytics | **Dashboard** — sales, profit, trends, stock alerts |
| Single location | **Multi-location ready** (same app, different branches) |

---

## Slide 3: What Has Been Migrated (Desktop → Web)

All core operations you use today are available in the web app:

| Module | Migrated Features |
|--------|-------------------|
| **POS Billing** | Create sale/return invoices, select customer, add items by code/name, quantity, unit price, discount, delivery mode (Counter/Delivery), payment method (Cash, Cheque, Bank Transfer, Online, Card), amount received, change returned, previous balance, print invoice |
| **By Invoice No** | Load existing invoice by number, view/edit, price comparison, new order from history, billing & payment |
| **Sales History** | List invoices by date range, search, view invoice details, delete line items, save |
| **Products** | Product master — code, name (EN/UR), brand, category, UOM, cost/selling price, min stock level, current stock; list, add, edit, search |
| **Customers** | Customer master — code, name, contact, mobile, address, city, credit limit; linked to ledger account for balance |
| **Purchases** | Purchase orders — supplier, items, quantities, prices; supports procurement workflow |
| **Stock** | Stock movements (in/out), current stock, low-stock alerts |
| **Ledger** | Account-wise ledger — account header, date range filter, account search, voucher-wise entries (Vch #, Date, Particulars, Dr, Cr, Running Balance), totals, opening/closing balance |

**Print & export**

- Invoice print (with/without header, with/without balance)
- Ledger report print (new window with Print/Close toolbar)
- Ledger export to CSV
- Zoom in/out in print preview

---

## Slide 4: New Features & Enhancements (Not in Desktop)

These exist **only** in the web application:

| Feature | Benefit |
|---------|---------|
| **Login & role-based access** | Secure login; Admin, Manager, Cashier with different permissions. Desktop has no login. |
| **Dashboard** | Today's sales, MTD sales, profit, cash flow, sales trend chart, top products, top customers, stock alerts. |
| **Theme (Light/Dark)** | User preference; easier on eyes. |
| **Responsive layout** | Usable on desktop and tablet; sidebar collapses. |
| **Snackbar notifications** | Clear success/error messages for actions. |
| **Confirmation dialogs** | Proper dialogs for delete/important actions instead of browser confirm. |
| **Ledger in new window** | Open current ledger report in new window; print when you want. |
| **API-first design** | REST API — ready for mobile app or integrations. |
| **Deployment flexibility** | Run on server, cloud, or Docker; one deployment serves all users. |

---

## Slide 5: Role-Based Access (New in Web)

The desktop application has **no user or role concept**. The web app adds:

| Role | Can Do |
|------|--------|
| **Admin** | Full access: Dashboard, POS, Products, Customers, Purchases, Stock, Ledger. |
| **Manager** | Dashboard, POS, Products, Customers, Purchases, Stock, Ledger. No user management. |
| **Cashier** | POS Billing, Products (view), Customers, Stock, Ledger. No Purchases/Dashboard as configured. |

Every request is authenticated (JWT); permissions enforced on the server.

---

## Slide 6: Security & Data

- Passwords stored with BCrypt hashing; no plain-text.
- JWT tokens for session; configurable expiry.
- HTTPS recommended in production.
- Centralized PostgreSQL data; easier backup and restore.
- Audit trail ready (invoice/ledger tied to user and time).

---

## Slide 7: Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Material UI, Vite |
| Backend | Java 17, Spring Boot 3, Spring Security (JWT) |
| Database | PostgreSQL 15 |
| Deployment | Docker; Railway, AWS, or on-premise |

---

## Slide 8: Summary — Why Choose the Web App

1. **Parity** — All essential desktop POS and ledger features migrated.
2. **More control** — Roles, dashboard, clearer UX.
3. **Security** — Login and roles (desktop has none).
4. **Visibility** — Dashboard and reports in one place.
5. **Flexibility** — Any device; deploy once, update once.
6. **Future-ready** — API supports mobile and integrations.

**Recommendation:** Adopt the web application as the primary POS; use the Login Credentials and Implementation documents for handover and deployment.

---

## Slide 9: Next Steps

- **Demo** — Login, roles, POS Billing, Ledger, Dashboard.
- **Credentials** — Use the **Login Credentials** document for all accounts.
- **Technical details** — See **Implementation and Development** document.
- **Go-live** — Plan cutover, user training, change default passwords.

---

*Document: Client Presentation — Desktop to Web POS Migration | Version: 1.0*
