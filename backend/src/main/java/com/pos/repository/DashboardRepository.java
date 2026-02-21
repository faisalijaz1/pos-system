package com.pos.repository;

import com.pos.domain.SalesInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Native queries for dashboard aggregations. Uses indexed columns:
 * sales_invoices(invoice_date), sales_invoice_items(sales_invoice_id, product_id),
 * ledger_entries(account_id, transaction_date), products(product_id, current_stock, min_stock_level).
 */
@Repository
public interface DashboardRepository extends JpaRepository<SalesInvoice, Integer> {

    @Query(value = "SELECT COALESCE(SUM(net_total), 0), COUNT(*) FROM sales_invoices WHERE invoice_date = :date", nativeQuery = true)
    Object[] todaySales(@Param("date") LocalDate date);

    @Query(value = "SELECT COALESCE(SUM(net_total), 0), COUNT(*) FROM sales_invoices WHERE invoice_date >= :fromDate AND invoice_date <= :toDate", nativeQuery = true)
    Object[] monthToDateSales(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query(value = "SELECT " +
           "COALESCE((SELECT SUM(si2.net_total) FROM sales_invoices si2 WHERE si2.invoice_date >= CAST(COALESCE(:fromDate, '1900-01-01') AS date) AND si2.invoice_date <= CAST(COALESCE(:toDate, '2100-12-31') AS date)), 0) AS revenue, " +
           "COALESCE((SELECT SUM(sii.quantity * p.cost_price) FROM sales_invoice_items sii JOIN sales_invoices si ON si.sales_invoice_id = sii.sales_invoice_id JOIN products p ON p.product_id = sii.product_id WHERE si.invoice_date >= CAST(COALESCE(:fromDate, '1900-01-01') AS date) AND si.invoice_date <= CAST(COALESCE(:toDate, '2100-12-31') AS date)), 0) AS cost", nativeQuery = true)
    Object[] profitAggregate(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query(value = "SELECT p.product_id, p.code, p.name_en, " +
           "COALESCE(SUM(sii.quantity), 0) AS qty_sold, COALESCE(SUM(sii.line_total), 0) AS revenue " +
           "FROM sales_invoice_items sii " +
           "JOIN sales_invoices si ON si.sales_invoice_id = sii.sales_invoice_id " +
           "JOIN products p ON p.product_id = sii.product_id " +
           "WHERE si.invoice_date >= CAST(COALESCE(:fromDate, '1900-01-01') AS date) AND si.invoice_date <= CAST(COALESCE(:toDate, '2100-12-31') AS date) " +
           "GROUP BY p.product_id, p.code, p.name_en " +
           "ORDER BY qty_sold DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> bestSellingProducts(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate, @Param("limit") int limit);

    @Query(value = "SELECT c.customer_id, c.name, COALESCE(SUM(si.net_total), 0) AS total_sales, COUNT(si.sales_invoice_id) AS invoice_count " +
           "FROM sales_invoices si " +
           "JOIN customers c ON c.customer_id = si.customer_id " +
           "WHERE si.customer_id IS NOT NULL " +
           "AND si.invoice_date >= CAST(COALESCE(:fromDate, '1900-01-01') AS date) AND si.invoice_date <= CAST(COALESCE(:toDate, '2100-12-31') AS date) " +
           "GROUP BY c.customer_id, c.name " +
           "ORDER BY total_sales DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> topCustomers(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate, @Param("limit") int limit);

    @Query(value = "SELECT si.invoice_date AS date, COALESCE(SUM(si.net_total), 0) AS amount, COUNT(*) AS invoice_count " +
           "FROM sales_invoices si " +
           "WHERE si.invoice_date >= CAST(COALESCE(:fromDate, '1900-01-01') AS date) AND si.invoice_date <= CAST(COALESCE(:toDate, '2100-12-31') AS date) " +
           "GROUP BY si.invoice_date " +
           "ORDER BY si.invoice_date", nativeQuery = true)
    List<Object[]> salesTrendDaily(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query(value = "SELECT DATE_TRUNC('month', si.invoice_date)::date AS month_start, COALESCE(SUM(si.net_total), 0) AS amount, COUNT(*) AS invoice_count " +
           "FROM sales_invoices si " +
           "WHERE si.invoice_date >= CAST(COALESCE(:fromDate, '1900-01-01') AS date) AND si.invoice_date <= CAST(COALESCE(:toDate, '2100-12-31') AS date) " +
           "GROUP BY DATE_TRUNC('month', si.invoice_date) " +
           "ORDER BY month_start", nativeQuery = true)
    List<Object[]> salesTrendMonthly(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query(value = "SELECT a.account_id, a.account_code, a.account_name, " +
           "COALESCE(SUM(CASE WHEN le.debit_amount > 0 THEN le.debit_amount ELSE 0 END), 0) AS inflows, " +
           "COALESCE(SUM(CASE WHEN le.credit_amount > 0 THEN le.credit_amount ELSE 0 END), 0) AS outflows " +
           "FROM accounts a " +
           "LEFT JOIN ledger_entries le ON le.account_id = a.account_id " +
           "AND le.transaction_date >= CAST(COALESCE(:fromDate, '1900-01-01') AS date) AND le.transaction_date <= CAST(COALESCE(:toDate, '2100-12-31') AS date) " +
           "WHERE a.account_type IN ('Cash', 'Bank') AND a.is_active = true " +
           "GROUP BY a.account_id, a.account_code, a.account_name", nativeQuery = true)
    List<Object[]> cashFlowByAccount(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query(value = "SELECT " +
           "COALESCE((SELECT SUM(le.debit_amount) FROM ledger_entries le JOIN accounts a ON a.account_id = le.account_id AND a.account_type IN ('Cash', 'Bank') AND a.is_active = true WHERE le.transaction_date >= CAST(COALESCE(:fromDate, '1900-01-01') AS date) AND le.transaction_date <= CAST(COALESCE(:toDate, '2100-12-31') AS date)), 0) AS inflows, " +
           "COALESCE((SELECT SUM(le.credit_amount) FROM ledger_entries le JOIN accounts a ON a.account_id = le.account_id AND a.account_type IN ('Cash', 'Bank') AND a.is_active = true WHERE le.transaction_date >= CAST(COALESCE(:fromDate, '1900-01-01') AS date) AND le.transaction_date <= CAST(COALESCE(:toDate, '2100-12-31') AS date)), 0) AS outflows", nativeQuery = true)
    Object[] cashFlowTotal(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query(value = "SELECT p.product_id, p.code, p.name_en, p.current_stock, p.min_stock_level " +
           "FROM products p " +
           "WHERE p.deleted_at IS NULL AND p.is_active = true " +
           "AND (p.current_stock < p.min_stock_level OR p.current_stock < 0) " +
           "ORDER BY p.current_stock ASC", nativeQuery = true)
    List<Object[]> stockAlerts();

    @Query(value = "SELECT COALESCE(SUM(CASE WHEN si.is_cash_customer = true THEN si.net_total ELSE 0 END), 0) AS cash_total, " +
           "COALESCE(SUM(CASE WHEN si.is_cash_customer = false AND si.customer_id IS NOT NULL THEN si.net_total ELSE 0 END), 0) AS credit_total " +
           "FROM sales_invoices si " +
           "WHERE si.invoice_date >= CAST(COALESCE(:fromDate, '1900-01-01') AS date) AND si.invoice_date <= CAST(COALESCE(:toDate, '2100-12-31') AS date)", nativeQuery = true)
    Object[] cashCreditRatio(@Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);
}
