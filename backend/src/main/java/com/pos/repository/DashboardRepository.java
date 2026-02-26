package com.pos.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.pos.domain.SalesInvoice;

/**
 * Dashboard aggregations.
 * - today/month-to-date: JPQL with LocalDateTime range (full-day inclusive when column is TIMESTAMP/TIMESTAMPTZ).
 * - profit and other date-filtered: native SQL with exclusive upper bound (to_date + interval '1 day') for full-day inclusion.
 */
@Repository
public interface DashboardRepository extends JpaRepository<SalesInvoice, Integer> {

	@Query("SELECT COALESCE(SUM(s.netTotal), 0), COUNT(s) " +
		       "FROM SalesInvoice s " +
		       "WHERE s.invoiceDate >= :from AND s.invoiceDate <= :to")
		Object[] todaySales(@Param("from") LocalDate from,
		                     @Param("to") LocalDate to);
	@Query(value = "SELECT COALESCE(SUM(si.net_total), 0), COUNT(*) " +
	        "FROM sales_invoices si " +
	        "WHERE si.invoice_date >= to_date(:fromDateStr, 'YYYY-MM-DD') " +
	        "AND si.invoice_date < to_date(:toDateStr, 'YYYY-MM-DD') + interval '1 day'",
	        nativeQuery = true)
	Object[] monthToDateSales(
	        @Param("fromDateStr") String fromDateStr,
	        @Param("toDateStr") String toDateStr);

    @Query(value = "SELECT " +
           "COALESCE((SELECT SUM(si2.net_total) FROM sales_invoices si2 WHERE si2.invoice_date >= to_date(:fromDateStr, 'YYYY-MM-DD') AND si2.invoice_date < to_date(:toDateStr, 'YYYY-MM-DD') + interval '1 day'), 0) AS revenue, " +
           "COALESCE((SELECT SUM(sii.quantity * p.cost_price) FROM sales_invoice_items sii JOIN sales_invoices si ON si.sales_invoice_id = sii.sales_invoice_id JOIN products p ON p.product_id = sii.product_id WHERE si.invoice_date >= to_date(:fromDateStr, 'YYYY-MM-DD') AND si.invoice_date < to_date(:toDateStr, 'YYYY-MM-DD') + interval '1 day'), 0) AS cost", nativeQuery = true)
    Object[] profitAggregate(@Param("fromDateStr") String fromDateStr, @Param("toDateStr") String toDateStr);

    @Query(value = "SELECT p.product_id, p.code, p.name_en, " +
           "COALESCE(SUM(sii.quantity), 0) AS qty_sold, COALESCE(SUM(sii.line_total), 0) AS revenue " +
           "FROM sales_invoice_items sii " +
           "JOIN sales_invoices si ON si.sales_invoice_id = sii.sales_invoice_id " +
           "JOIN products p ON p.product_id = sii.product_id " +
           "WHERE si.invoice_date >= to_date(:fromDateStr, 'YYYY-MM-DD') AND si.invoice_date < to_date(:toDateStr, 'YYYY-MM-DD') + interval '1 day' " +
           "GROUP BY p.product_id, p.code, p.name_en " +
           "ORDER BY qty_sold DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> bestSellingProducts(@Param("fromDateStr") String fromDateStr, @Param("toDateStr") String toDateStr, @Param("limit") int limit);

    @Query(value = "SELECT c.customer_id, c.name, COALESCE(SUM(si.net_total), 0) AS total_sales, COUNT(si.sales_invoice_id) AS invoice_count " +
           "FROM sales_invoices si " +
           "JOIN customers c ON c.customer_id = si.customer_id " +
           "WHERE si.customer_id IS NOT NULL " +
           "AND si.invoice_date >= to_date(:fromDateStr, 'YYYY-MM-DD') AND si.invoice_date < to_date(:toDateStr, 'YYYY-MM-DD') + interval '1 day' " +
           "GROUP BY c.customer_id, c.name " +
           "ORDER BY total_sales DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> topCustomers(@Param("fromDateStr") String fromDateStr, @Param("toDateStr") String toDateStr, @Param("limit") int limit);

    @Query(value = "SELECT si.invoice_date AS date, COALESCE(SUM(si.net_total), 0) AS amount, COUNT(*) AS invoice_count " +
           "FROM sales_invoices si " +
           "WHERE si.invoice_date >= to_date(:fromDateStr, 'YYYY-MM-DD') AND si.invoice_date < to_date(:toDateStr, 'YYYY-MM-DD') + interval '1 day' " +
           "GROUP BY si.invoice_date " +
           "ORDER BY si.invoice_date", nativeQuery = true)
    List<Object[]> salesTrendDaily(@Param("fromDateStr") String fromDateStr, @Param("toDateStr") String toDateStr);

    @Query(value = "SELECT DATE_TRUNC('month', si.invoice_date)::date AS month_start, COALESCE(SUM(si.net_total), 0) AS amount, COUNT(*) AS invoice_count " +
           "FROM sales_invoices si " +
           "WHERE si.invoice_date >= to_date(:fromDateStr, 'YYYY-MM-DD') AND si.invoice_date < to_date(:toDateStr, 'YYYY-MM-DD') + interval '1 day' " +
           "GROUP BY DATE_TRUNC('month', si.invoice_date) " +
           "ORDER BY month_start", nativeQuery = true)
    List<Object[]> salesTrendMonthly(@Param("fromDateStr") String fromDateStr, @Param("toDateStr") String toDateStr);

    @Query(value = "SELECT a.account_id, a.account_code, a.account_name, " +
           "COALESCE(SUM(CASE WHEN le.debit_amount > 0 THEN le.debit_amount ELSE 0 END), 0) AS inflows, " +
           "COALESCE(SUM(CASE WHEN le.credit_amount > 0 THEN le.credit_amount ELSE 0 END), 0) AS outflows " +
           "FROM accounts a " +
           "LEFT JOIN ledger_entries le ON le.account_id = a.account_id " +
           "AND le.transaction_date >= to_date(:fromDateStr, 'YYYY-MM-DD') AND le.transaction_date < to_date(:toDateStr, 'YYYY-MM-DD') + interval '1 day' " +
           "WHERE a.account_type IN ('Cash', 'Bank') AND a.is_active = true " +
           "GROUP BY a.account_id, a.account_code, a.account_name", nativeQuery = true)
    List<Object[]> cashFlowByAccount(@Param("fromDateStr") String fromDateStr, @Param("toDateStr") String toDateStr);

    @Query(value = "SELECT " +
           "COALESCE((SELECT SUM(le.debit_amount) FROM ledger_entries le JOIN accounts a ON a.account_id = le.account_id AND a.account_type IN ('Cash', 'Bank') AND a.is_active = true WHERE le.transaction_date >= to_date(:fromDateStr, 'YYYY-MM-DD') AND le.transaction_date < to_date(:toDateStr, 'YYYY-MM-DD') + interval '1 day'), 0) AS inflows, " +
           "COALESCE((SELECT SUM(le.credit_amount) FROM ledger_entries le JOIN accounts a ON a.account_id = le.account_id AND a.account_type IN ('Cash', 'Bank') AND a.is_active = true WHERE le.transaction_date >= to_date(:fromDateStr, 'YYYY-MM-DD') AND le.transaction_date < to_date(:toDateStr, 'YYYY-MM-DD') + interval '1 day'), 0) AS outflows", nativeQuery = true)
    Object[] cashFlowTotal(@Param("fromDateStr") String fromDateStr, @Param("toDateStr") String toDateStr);

    @Query(value = "SELECT p.product_id, p.code, p.name_en, p.current_stock, p.min_stock_level " +
           "FROM products p " +
           "WHERE p.deleted_at IS NULL AND p.is_active = true " +
           "AND (p.current_stock < p.min_stock_level OR p.current_stock < 0) " +
           "ORDER BY p.current_stock ASC", nativeQuery = true)
    List<Object[]> stockAlerts();

    @Query(value = "SELECT COALESCE(SUM(CASE WHEN si.is_cash_customer = true THEN si.net_total ELSE 0 END), 0) AS cash_total, " +
           "COALESCE(SUM(CASE WHEN si.is_cash_customer = false AND si.customer_id IS NOT NULL THEN si.net_total ELSE 0 END), 0) AS credit_total " +
           "FROM sales_invoices si " +
           "WHERE si.invoice_date >= to_date(:fromDateStr, 'YYYY-MM-DD') AND si.invoice_date < to_date(:toDateStr, 'YYYY-MM-DD') + interval '1 day'", nativeQuery = true)
    Object[] cashCreditRatio(@Param("fromDateStr") String fromDateStr, @Param("toDateStr") String toDateStr);
}
