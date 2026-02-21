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

    @Transactional(readOnly = true)
    public TodaySalesDto getTodaySales() {
        try {
            LocalDate today = LocalDate.now();
            Object[] row = dashboardRepository.todaySales(today);
        if (row == null || row.length < 2) {
            return TodaySalesDto.builder().totalSales(BigDecimal.ZERO).invoiceCount(0L).build();
        }
        BigDecimal total = row[0] != null ? (BigDecimal) row[0] : BigDecimal.ZERO;
        Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
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
    public MonthToDateDto getMonthToDate() {
        try {
            LocalDate today = LocalDate.now();
            LocalDate from = today.withDayOfMonth(1);
            Object[] row = dashboardRepository.monthToDateSales(from, today);
            if (row == null || row.length < 2) {
                return MonthToDateDto.builder().totalSales(BigDecimal.ZERO).invoiceCount(0L).fromDate(from).toDate(today).build();
            }
            BigDecimal total = row[0] != null ? (BigDecimal) row[0] : BigDecimal.ZERO;
            Long count = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            return MonthToDateDto.builder()
                    .totalSales(total)
                    .invoiceCount(count)
                    .fromDate(from)
                    .toDate(today)
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
            Object[] row = dashboardRepository.profitAggregate(fromDate, toDate);
            if (row == null || row.length < 2) {
                return ProfitDto.builder().revenue(BigDecimal.ZERO).cost(BigDecimal.ZERO).profit(BigDecimal.ZERO).marginPercent(BigDecimal.ZERO).build();
            }
            BigDecimal revenue = row[0] != null ? (BigDecimal) row[0] : BigDecimal.ZERO;
            BigDecimal cost = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
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
            List<Object[]> rows = dashboardRepository.bestSellingProducts(fromDate, toDate, limit);
            return rows.stream().map(row -> BestSellingProductDto.builder()
                .productId(((Number) row[0]).intValue())
                .productCode((String) row[1])
                .productName((String) row[2])
                .quantitySold(row[3] != null ? (BigDecimal) row[3] : BigDecimal.ZERO)
                .revenue(row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO)
                .build()).collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Dashboard getBestSellingProducts failed", e);
            return Collections.emptyList();
        }
    }

    @Transactional(readOnly = true)
    public List<TopCustomerDto> getTopCustomers(LocalDate fromDate, LocalDate toDate, int limit) {
        try {
            List<Object[]> rows = dashboardRepository.topCustomers(fromDate, toDate, limit);
            return rows.stream().map(row -> TopCustomerDto.builder()
                    .customerId(((Number) row[0]).intValue())
                    .customerName((String) row[1])
                    .totalSales(row[2] != null ? (BigDecimal) row[2] : BigDecimal.ZERO)
                    .invoiceCount(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                    .build()).collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Dashboard getTopCustomers failed", e);
            return Collections.emptyList();
        }
    }

    @Transactional(readOnly = true)
    public SalesTrendDto getSalesTrend(LocalDate fromDate, LocalDate toDate) {
        try {
            List<Object[]> rows = dashboardRepository.salesTrendDaily(fromDate, toDate);
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
            BigDecimal amount = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
            Long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
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
            Object[] totalRow = dashboardRepository.cashFlowTotal(fromDate, toDate);
            if (totalRow == null || totalRow.length < 2) {
                return CashFlowDto.builder().inflows(BigDecimal.ZERO).outflows(BigDecimal.ZERO).net(BigDecimal.ZERO).byAccount(new ArrayList<>()).build();
            }
            BigDecimal totalInflows = totalRow[0] != null ? (BigDecimal) totalRow[0] : BigDecimal.ZERO;
            BigDecimal totalOutflows = totalRow[1] != null ? (BigDecimal) totalRow[1] : BigDecimal.ZERO;
            BigDecimal net = totalInflows.subtract(totalOutflows);

            List<Object[]> byAccountRows = dashboardRepository.cashFlowByAccount(fromDate, toDate);
            List<CashFlowDto.CashFlowByAccountDto> byAccount = new ArrayList<>();
            for (Object[] row : byAccountRows) {
                if (row == null || row.length < 5) continue;
                BigDecimal in = row[3] != null ? (BigDecimal) row[3] : BigDecimal.ZERO;
                BigDecimal out = row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO;
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
                .currentStock(row[3] != null ? (BigDecimal) row[3] : BigDecimal.ZERO)
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
            Object[] row = dashboardRepository.cashCreditRatio(fromDate, toDate);
            if (row == null || row.length < 2) {
                return CashCreditRatioDto.builder().cashSalesTotal(BigDecimal.ZERO).creditSalesTotal(BigDecimal.ZERO).cashRatio(BigDecimal.ZERO).creditRatio(BigDecimal.ZERO).build();
            }
            BigDecimal cashTotal = row[0] != null ? (BigDecimal) row[0] : BigDecimal.ZERO;
            BigDecimal creditTotal = row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
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
