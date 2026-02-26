package com.pos.service;

import com.pos.dto.dashboard.*;
import com.pos.repository.DashboardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Dashboard analytics: KPIs from sales_invoices, sales_invoice_items, ledger_entries, products.
 * Queries use indexed columns for performance. Consider @Cacheable with short TTL (e.g. 1–5 min) for heavy traffic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    private static String toDateStr(LocalDate d, String defaultVal) {
        return d != null ? d.toString() : defaultVal;
    }

    /** Safely map result row value to BigDecimal (Hibernate may return Long/Double/BigInteger for SUM). */
    private static BigDecimal toBigDecimal(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof BigDecimal) return (BigDecimal) o;
        if (o instanceof Number) return BigDecimal.valueOf(((Number) o).doubleValue());
        return BigDecimal.ZERO;
    }

    /** Safely map result row value to Long (for COUNT). */
    private static long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Number) return ((Number) o).longValue();
        return 0L;
    }

    @Transactional(readOnly = true)
    public TodaySalesDto getTodaySales(LocalDate fromDate, LocalDate toDate) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate fromDay = (fromDate != null && toDate != null) ? fromDate : today;
            LocalDate toDay = (fromDate != null && toDate != null) ? toDate : today;
            LocalDateTime from = fromDay.atStartOfDay();
            LocalDateTime to = toDay.atTime(LocalTime.MAX);
            Object[] row = dashboardRepository.todaySales(from, to);
        if (row == null || row.length < 2) {
            return TodaySalesDto.builder().totalSales(BigDecimal.ZERO).invoiceCount(0L).build();
        }
        BigDecimal total = toBigDecimal(row[0]);
        Long count = toLong(row[1]);
        return TodaySalesDto.builder()
                .totalSales(total)
                .invoiceCount(count)
                .build();
        } catch (Exception e) {
            log.warn("Dashboard getTodaySales failed", e);
            return TodaySalesDto.builder().totalSales(BigDecimal.ZERO).invoiceCount(0L).build();
        }
    }

    @Transactional(readOnly = true)
    public MonthToDateDto getMonthToDate(LocalDate fromDate, LocalDate toDate) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate fromDay = (fromDate != null && toDate != null) ? fromDate : today.withDayOfMonth(1);
            LocalDate toDay = (fromDate != null && toDate != null) ? toDate : today;
            LocalDateTime from = fromDay.atStartOfDay();
            LocalDateTime to = toDay.atTime(LocalTime.MAX);
            Object[] row = dashboardRepository.monthToDateSales(from, to);
            if (row == null || row.length < 2) {
                return MonthToDateDto.builder().totalSales(BigDecimal.ZERO).invoiceCount(0L).fromDate(fromDay).toDate(toDay).build();
            }
            BigDecimal total = toBigDecimal(row[0]);
            Long count = toLong(row[1]);
            return MonthToDateDto.builder()
                    .totalSales(total)
                    .invoiceCount(count)
                    .fromDate(fromDay)
                    .toDate(toDay)
                    .build();
        } catch (Exception e) {
            log.warn("Dashboard getMonthToDate failed", e);
            LocalDate today = LocalDate.now();
            LocalDate from = today.withDayOfMonth(1);
            return MonthToDateDto.builder().totalSales(BigDecimal.ZERO).invoiceCount(0L).fromDate(from).toDate(today).build();
        }
    }

    @Transactional(readOnly = true)
    public ProfitDto getProfit(LocalDate fromDate, LocalDate toDate) {
        try {
            String fromStr = toDateStr(fromDate, "1900-01-01");
            String toStr = toDateStr(toDate, "2100-12-31");
            Object[] row = dashboardRepository.profitAggregate(fromStr, toStr);
            if (row == null || row.length < 2) {
                return ProfitDto.builder().revenue(BigDecimal.ZERO).cost(BigDecimal.ZERO).profit(BigDecimal.ZERO).marginPercent(BigDecimal.ZERO).build();
            }
            BigDecimal revenue = toBigDecimal(row[0]);
            BigDecimal cost = toBigDecimal(row[1]);
            BigDecimal profit = revenue.subtract(cost);
            BigDecimal marginPercent = revenue.compareTo(BigDecimal.ZERO) > 0
                    ? profit.multiply(BigDecimal.valueOf(100)).divide(revenue, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            return ProfitDto.builder()
                    .revenue(revenue)
                    .cost(cost)
                    .profit(profit)
                    .marginPercent(marginPercent)
                    .build();
        } catch (Exception e) {
            log.warn("Dashboard getProfit failed", e);
            return ProfitDto.builder().revenue(BigDecimal.ZERO).cost(BigDecimal.ZERO).profit(BigDecimal.ZERO).marginPercent(BigDecimal.ZERO).build();
        }
    }

    @Transactional(readOnly = true)
    public List<BestSellingProductDto> getBestSellingProducts(LocalDate fromDate, LocalDate toDate, int limit) {
        try {
            String fromStr = toDateStr(fromDate, "1900-01-01");
            String toStr = toDateStr(toDate, "2100-12-31");
            List<Object[]> rows = dashboardRepository.bestSellingProducts(fromStr, toStr, limit);
            return rows.stream().map(row -> BestSellingProductDto.builder()
                .productId(((Number) row[0]).intValue())
                .productCode((String) row[1])
                .productName((String) row[2])
                .quantitySold(toBigDecimal(row[3]))
                .revenue(toBigDecimal(row[4]))
                .build()).collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Dashboard getBestSellingProducts failed", e);
            return Collections.emptyList();
        }
    }

    @Transactional(readOnly = true)
    public List<TopCustomerDto> getTopCustomers(LocalDate fromDate, LocalDate toDate, int limit) {
        try {
            String fromStr = toDateStr(fromDate, "1900-01-01");
            String toStr = toDateStr(toDate, "2100-12-31");
            List<Object[]> rows = dashboardRepository.topCustomers(fromStr, toStr, limit);
            return rows.stream().map(row -> TopCustomerDto.builder()
                    .customerId(((Number) row[0]).intValue())
                    .customerName((String) row[1])
                    .totalSales(toBigDecimal(row[2]))
                    .invoiceCount(toLong(row[3]))
                    .build()).collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Dashboard getTopCustomers failed", e);
            return Collections.emptyList();
        }
    }

    @Transactional(readOnly = true)
    public SalesTrendDto getSalesTrend(LocalDate fromDate, LocalDate toDate) {
        try {
            String fromStr = toDateStr(fromDate, "1900-01-01");
            String toStr = toDateStr(toDate, "2100-12-31");
            List<Object[]> rows = dashboardRepository.salesTrendDaily(fromStr, toStr);
        List<SalesTrendDto.SalesTrendRowDto> data = new ArrayList<>();
        for (Object[] row : rows) {
            LocalDate date = null;
            if (row[0] != null) {
                if (row[0] instanceof java.sql.Date) {
                    date = ((java.sql.Date) row[0]).toLocalDate();
                } else if (row[0] instanceof java.sql.Timestamp) {
                    date = ((java.sql.Timestamp) row[0]).toLocalDateTime().toLocalDate();
                } else if (row[0] instanceof LocalDate) {
                    date = (LocalDate) row[0];
                }
            }
            if (date == null) continue;
            BigDecimal amount = toBigDecimal(row[1]);
            Long count = toLong(row[2]);
            data.add(SalesTrendDto.SalesTrendRowDto.builder()
                    .date(date)
                    .amount(amount)
                    .invoiceCount(count)
                    .build());
        }
            return SalesTrendDto.builder().data(data).build();
        } catch (Exception e) {
            log.warn("Dashboard getSalesTrend failed", e);
            return SalesTrendDto.builder().data(Collections.emptyList()).build();
        }
    }

    @Transactional(readOnly = true)
    public CashFlowDto getCashFlow(LocalDate fromDate, LocalDate toDate) {
        try {
            String fromStr = toDateStr(fromDate, "1900-01-01");
            String toStr = toDateStr(toDate, "2100-12-31");
            Object[] totalRow = dashboardRepository.cashFlowTotal(fromStr, toStr);
            if (totalRow == null || totalRow.length < 2) {
                return CashFlowDto.builder().inflows(BigDecimal.ZERO).outflows(BigDecimal.ZERO).net(BigDecimal.ZERO).byAccount(new ArrayList<>()).build();
            }
            BigDecimal totalInflows = toBigDecimal(totalRow[0]);
            BigDecimal totalOutflows = toBigDecimal(totalRow[1]);
            BigDecimal net = totalInflows.subtract(totalOutflows);

            List<Object[]> byAccountRows = dashboardRepository.cashFlowByAccount(fromStr, toStr);
            List<CashFlowDto.CashFlowByAccountDto> byAccount = new ArrayList<>();
            for (Object[] row : byAccountRows) {
                if (row == null || row.length < 5) continue;
                BigDecimal in = toBigDecimal(row[3]);
                BigDecimal out = toBigDecimal(row[4]);
                byAccount.add(CashFlowDto.CashFlowByAccountDto.builder()
                        .accountId(((Number) row[0]).intValue())
                        .accountCode((String) row[1])
                        .accountName((String) row[2])
                        .inflows(in)
                        .outflows(out)
                        .net(in.subtract(out))
                        .build());
            }
            return CashFlowDto.builder()
                    .inflows(totalInflows)
                    .outflows(totalOutflows)
                    .net(net)
                    .byAccount(byAccount)
                    .build();
        } catch (Exception e) {
            log.warn("Dashboard getCashFlow failed", e);
            return CashFlowDto.builder().inflows(BigDecimal.ZERO).outflows(BigDecimal.ZERO).net(BigDecimal.ZERO).byAccount(new ArrayList<>()).build();
        }
    }

    @Transactional(readOnly = true)
    public List<StockAlertDto> getStockAlerts() {
        try {
            List<Object[]> rows = dashboardRepository.stockAlerts();
            return rows.stream().map(row -> StockAlertDto.builder()
                .productId(((Number) row[0]).intValue())
                .productCode((String) row[1])
                .productName((String) row[2])
                .currentStock(toBigDecimal(row[3]))
                .minStockLevel(row[4] != null ? ((Number) row[4]).intValue() : 0)
                .build()).collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Dashboard getStockAlerts failed", e);
            return Collections.emptyList();
        }
    }

    @Transactional(readOnly = true)
    public CashCreditRatioDto getCashCreditRatio(LocalDate fromDate, LocalDate toDate) {
        try {
            String fromStr = toDateStr(fromDate, "1900-01-01");
            String toStr = toDateStr(toDate, "2100-12-31");
            Object[] row = dashboardRepository.cashCreditRatio(fromStr, toStr);
            if (row == null || row.length < 2) {
                return CashCreditRatioDto.builder().cashSalesTotal(BigDecimal.ZERO).creditSalesTotal(BigDecimal.ZERO).cashRatio(BigDecimal.ZERO).creditRatio(BigDecimal.ZERO).build();
            }
            BigDecimal cashTotal = toBigDecimal(row[0]);
            BigDecimal creditTotal = toBigDecimal(row[1]);
            BigDecimal total = cashTotal.add(creditTotal);
            BigDecimal cashRatio = total.compareTo(BigDecimal.ZERO) > 0
                    ? cashTotal.divide(total, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            BigDecimal creditRatio = total.compareTo(BigDecimal.ZERO) > 0
                    ? creditTotal.divide(total, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            return CashCreditRatioDto.builder()
                    .cashSalesTotal(cashTotal)
                    .creditSalesTotal(creditTotal)
                    .cashRatio(cashRatio)
                    .creditRatio(creditRatio)
                    .build();
        } catch (Exception e) {
            log.warn("Dashboard getCashCreditRatio failed", e);
            return CashCreditRatioDto.builder().cashSalesTotal(BigDecimal.ZERO).creditSalesTotal(BigDecimal.ZERO).cashRatio(BigDecimal.ZERO).creditRatio(BigDecimal.ZERO).build();
        }
    }
}
