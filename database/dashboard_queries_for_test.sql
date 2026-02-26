-- =============================================================================
-- DASHBOARD SQL QUERIES (run directly in PostgreSQL)
-- Replace the date literals if you need a different range.
-- =============================================================================

-- Example params (same as dashboard for 2026-02-26):
-- Today: fromDate = 2026-02-26, toDate = 2026-02-26
-- MTD:   fromDate = 2026-02-01, toDate = 2026-02-26
-- =============================================================================

-- 1) TODAY'S SALES (JPQL → Hibernate generates this)
-- GET /v1/dashboard/today-sales?fromDate=2026-02-26&toDate=2026-02-26
SELECT
    COALESCE(SUM(s.net_total), 0) AS total_sales,
    COUNT(s.sales_invoice_id)    AS invoice_count
FROM sales_invoices s
WHERE s.invoice_date >= '2026-02-26'
  AND s.invoice_date <= '2026-02-26';


-- 2) MONTH TO DATE (JPQL → Hibernate generates this)
-- GET /v1/dashboard/month-to-date?fromDate=2026-02-01&toDate=2026-02-26
SELECT
    COALESCE(SUM(s.net_total), 0) AS total_sales,
    COUNT(s.sales_invoice_id)    AS invoice_count
FROM sales_invoices s
WHERE s.invoice_date >= '2026-02-01'
  AND s.invoice_date <= '2026-02-26';


-- 3) SALES TREND (native query)
-- GET /v1/dashboard/sales-trend?fromDate=2026-02-01&toDate=2026-02-26
SELECT
    si.invoice_date AS date,
    COALESCE(SUM(si.net_total), 0) AS amount,
    COUNT(*) AS invoice_count
FROM sales_invoices si
WHERE si.invoice_date >= to_date('2026-02-01', 'YYYY-MM-DD')
  AND si.invoice_date <= to_date('2026-02-26', 'YYYY-MM-DD')
GROUP BY si.invoice_date
ORDER BY si.invoice_date;


-- 4) PROFIT (native query)
-- GET /v1/dashboard/profit?fromDate=2026-02-01&toDate=2026-02-26
SELECT
    COALESCE((
        SELECT SUM(si2.net_total)
        FROM sales_invoices si2
        WHERE si2.invoice_date >= to_date('2026-02-01', 'YYYY-MM-DD')
          AND si2.invoice_date <= to_date('2026-02-26', 'YYYY-MM-DD')
    ), 0) AS revenue,
    COALESCE((
        SELECT SUM(sii.quantity * p.cost_price)
        FROM sales_invoice_items sii
        JOIN sales_invoices si ON si.sales_invoice_id = sii.sales_invoice_id
        JOIN products p ON p.product_id = sii.product_id
        WHERE si.invoice_date >= to_date('2026-02-01', 'YYYY-MM-DD')
          AND si.invoice_date <= to_date('2026-02-26', 'YYYY-MM-DD')
    ), 0) AS cost;


-- 5) CASH FLOW TOTAL (native query)
-- GET /v1/dashboard/cash-flow?fromDate=2026-02-01&toDate=2026-02-26
SELECT
    COALESCE((
        SELECT SUM(le.debit_amount)
        FROM ledger_entries le
        JOIN accounts a ON a.account_id = le.account_id
         AND a.account_type IN ('Cash', 'Bank')
         AND a.is_active = true
        WHERE le.transaction_date >= to_date('2026-02-01', 'YYYY-MM-DD')
          AND le.transaction_date <= to_date('2026-02-26', 'YYYY-MM-DD')
    ), 0) AS inflows,
    COALESCE((
        SELECT SUM(le.credit_amount)
        FROM ledger_entries le
        JOIN accounts a ON a.account_id = le.account_id
         AND a.account_type IN ('Cash', 'Bank')
         AND a.is_active = true
        WHERE le.transaction_date >= to_date('2026-02-01', 'YYYY-MM-DD')
          AND le.transaction_date <= to_date('2026-02-26', 'YYYY-MM-DD')
    ), 0) AS outflows;


-- 6) TOP CUSTOMERS (native query, limit 5)
SELECT
    c.customer_id,
    c.name,
    COALESCE(SUM(si.net_total), 0) AS total_sales,
    COUNT(si.sales_invoice_id)    AS invoice_count
FROM sales_invoices si
JOIN customers c ON c.customer_id = si.customer_id
WHERE si.customer_id IS NOT NULL
  AND si.invoice_date >= to_date('2026-02-01', 'YYYY-MM-DD')
  AND si.invoice_date <= to_date('2026-02-26', 'YYYY-MM-DD')
GROUP BY c.customer_id, c.name
ORDER BY total_sales DESC
LIMIT 5;


-- 7) BEST SELLING PRODUCTS (native query, limit 5)
SELECT
    p.product_id,
    p.code,
    p.name_en,
    COALESCE(SUM(sii.quantity), 0)    AS qty_sold,
    COALESCE(SUM(sii.line_total), 0)   AS revenue
FROM sales_invoice_items sii
JOIN sales_invoices si ON si.sales_invoice_id = sii.sales_invoice_id
JOIN products p ON p.product_id = sii.product_id
WHERE si.invoice_date >= to_date('2026-02-01', 'YYYY-MM-DD')
  AND si.invoice_date <= to_date('2026-02-26', 'YYYY-MM-DD')
GROUP BY p.product_id, p.code, p.name_en
ORDER BY qty_sold DESC
LIMIT 5;


-- 8) STOCK ALERTS (no date params)
SELECT
    p.product_id,
    p.code,
    p.name_en,
    p.current_stock,
    p.min_stock_level
FROM products p
WHERE p.deleted_at IS NULL
  AND p.is_active = true
  AND (p.current_stock < p.min_stock_level OR p.current_stock < 0)
ORDER BY p.current_stock ASC;
