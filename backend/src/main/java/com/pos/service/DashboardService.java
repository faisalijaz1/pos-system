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
import java.util.Arrays;
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
        String methodName = "getTodaySales";
        log.info("===== ENTERING METHOD: {} =====", methodName);
        log.info("Input parameters - fromDate: {}, toDate: {}", fromDate, toDate);
        
        try {
            LocalDate today = LocalDate.now();
            LocalDate from = (fromDate != null && toDate != null) ? fromDate : today;
            LocalDate to = (fromDate != null && toDate != null) ? toDate : today;
            
            log.info("Processed dates - from: {}, to: {}", from, to);
            log.info("Calling repository method: dashboardRepository.todaySales with params: from={}, to={}", from, to);

            Object[] row = dashboardRepository.todaySales(from, to);
            
            log.info("Query executed successfully");
            log.info("Result row: {}, length: {}", row != null ? Arrays.toString(row) : "null", 
                     row != null ? row.length : 0);

            if (row == null || row.length < 2) {
                log.warn("Query returned null or insufficient data. row is null: {}, row length < 2: {}", 
                         row == null, row != null && row.length < 2);
                return TodaySalesDto.builder()
                        .totalSales(BigDecimal.ZERO)
                        .invoiceCount(0L)
                        .build();
            }

            BigDecimal totalSales = toBigDecimal(row[0]);
            Long invoiceCount = toLong(row[1]);
            
            log.info("Processed results - totalSales: {}, invoiceCount: {}", totalSales, invoiceCount);
            log.info("===== EXITING METHOD: {} =====", methodName);
            
            return TodaySalesDto.builder()
                    .totalSales(totalSales)
                    .invoiceCount(invoiceCount)
                    .build();

        } catch (Exception e) {
            log.error("===== EXCEPTION IN METHOD: {} =====", methodName, e);
            throw e; // Re-throw to let the controller handle it
        }
    }

    @Transactional(readOnly = true)
    public MonthToDateDto getMonthToDate(LocalDate fromDate, LocalDate toDate) {
        String methodName = "getMonthToDate";
        log.info("===== ENTERING METHOD: {} =====", methodName);
        log.info("Input parameters - fromDate: {}, toDate: {}", fromDate, toDate);
        
        try {
            LocalDate today = LocalDate.now();

            LocalDate fromDay = (fromDate != null && toDate != null)
                    ? fromDate
                    : today.withDayOfMonth(1);

            LocalDate toDay = (fromDate != null && toDate != null)
                    ? toDate
                    : today;

            String fromStr = fromDay.toString();
            String toStr = toDay.toString();
            
            log.info("Processed dates - fromDay: {}, toDay: {}", fromDay, toDay);
            log.info("Converted to strings - fromStr: {}, toStr: {}", fromStr, toStr);
            log.info("Calling repository method: dashboardRepository.monthToDateSales with params: fromStr={}, toStr={}", fromStr, toStr);

            Object[] row = dashboardRepository.monthToDateSales(fromStr, toStr);
            
            log.info("Query executed successfully");
            log.info("Result row: {}, length: {}", row != null ? Arrays.toString(row) : "null", 
                     row != null ? row.length : 0);

            if (row == null || row.length < 2) {
                log.warn("Query returned null or insufficient data. row is null: {}, row length < 2: {}", 
                         row == null, row != null && row.length < 2);
                return MonthToDateDto.builder()
                        .totalSales(BigDecimal.ZERO)
                        .invoiceCount(0L)
                        .fromDate(fromDay)
                        .toDate(toDay)
                        .build();
            }

            BigDecimal total = toBigDecimal(row[0]);
            Long count = toLong(row[1]);
            
            log.info("Processed results - total: {}, count: {}", total, count);
            log.info("===== EXITING METHOD: {} =====", methodName);

            return MonthToDateDto.builder()
                    .totalSales(total)
                    .invoiceCount(count)
                    .fromDate(fromDay)
                    .toDate(toDay)
                    .build();

        } catch (Exception e) {
            log.error("===== EXCEPTION IN METHOD: {} =====", methodName, e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public ProfitDto getProfit(LocalDate fromDate, LocalDate toDate) {
        String methodName = "getProfit";
        log.info("===== ENTERING METHOD: {} =====", methodName);
        log.info("Input parameters - fromDate: {}, toDate: {}", fromDate, toDate);
        
        try {
            String fromStr = toDateStr(fromDate, "1900-01-01");
            String toStr = toDateStr(toDate, "2100-12-31");
            
            log.info("Converted date strings - fromStr: {}, toStr: {}", fromStr, toStr);
            log.info("Calling repository method: dashboardRepository.profitAggregate with params: fromStr={}, toStr={}", fromStr, toStr);
            
            Object[] row = dashboardRepository.profitAggregate(fromStr, toStr);
            
            log.info("Query executed successfully");
            log.info("Result row: {}, length: {}", row != null ? Arrays.toString(row) : "null", 
                     row != null ? row.length : 0);
            
            if (row == null || row.length < 2) {
                log.warn("Query returned null or insufficient data. row is null: {}, row length < 2: {}", 
                         row == null, row != null && row.length < 2);
                return ProfitDto.builder()
                        .revenue(BigDecimal.ZERO)
                        .cost(BigDecimal.ZERO)
                        .profit(BigDecimal.ZERO)
                        .marginPercent(BigDecimal.ZERO)
                        .build();
            }
            
            BigDecimal revenue = toBigDecimal(row[0]);
            BigDecimal cost = toBigDecimal(row[1]);
            BigDecimal profit = revenue.subtract(cost);
            BigDecimal marginPercent = revenue.compareTo(BigDecimal.ZERO) > 0
                    ? profit.multiply(BigDecimal.valueOf(100)).divide(revenue, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            
            log.info("Processed results - revenue: {}, cost: {}, profit: {}, marginPercent: {}", 
                     revenue, cost, profit, marginPercent);
            log.info("===== EXITING METHOD: {} =====", methodName);
            
            return ProfitDto.builder()
                    .revenue(revenue)
                    .cost(cost)
                    .profit(profit)
                    .marginPercent(marginPercent)
                    .build();
                    
        } catch (Exception e) {
            log.error("===== EXCEPTION IN METHOD: {} =====", methodName, e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<BestSellingProductDto> getBestSellingProducts(LocalDate fromDate, LocalDate toDate, int limit) {
        String methodName = "getBestSellingProducts";
        log.info("===== ENTERING METHOD: {} =====", methodName);
        log.info("Input parameters - fromDate: {}, toDate: {}, limit: {}", fromDate, toDate, limit);
        
        try {
            String fromStr = toDateStr(fromDate, "1900-01-01");
            String toStr = toDateStr(toDate, "2100-12-31");
            
            log.info("Converted date strings - fromStr: {}, toStr: {}", fromStr, toStr);
            log.info("Calling repository method: dashboardRepository.bestSellingProducts with params: fromStr={}, toStr={}, limit={}", 
                     fromStr, toStr, limit);
            
            List<Object[]> rows = dashboardRepository.bestSellingProducts(fromStr, toStr, limit);
            
            log.info("Query executed successfully. Number of rows returned: {}", rows != null ? rows.size() : 0);
            
            if (rows == null || rows.isEmpty()) {
                log.info("No best selling products found for the given criteria");
                log.info("===== EXITING METHOD: {} =====", methodName);
                return new ArrayList<>();
            }
            
            log.info("Processing {} result rows", rows.size());
            
            List<BestSellingProductDto> results = rows.stream().map(row -> {
                BestSellingProductDto dto = BestSellingProductDto.builder()
                        .productId(((Number) row[0]).intValue())
                        .productCode((String) row[1])
                        .productName((String) row[2])
                        .quantitySold(toBigDecimal(row[3]))
                        .revenue(toBigDecimal(row[4]))
                        .build();
                
                log.debug("Processed row - productId: {}, productCode: {}, productName: {}, quantitySold: {}, revenue: {}",
                         dto.getProductId(), dto.getProductCode(), dto.getProductName(), 
                         dto.getQuantitySold(), dto.getRevenue());
                
                return dto;
            }).collect(Collectors.toList());
            
            log.info("Successfully processed {} best selling products", results.size());
            log.info("===== EXITING METHOD: {} =====", methodName);
            
            return results;
            
        } catch (Exception e) {
            log.error("===== EXCEPTION IN METHOD: {} =====", methodName, e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<TopCustomerDto> getTopCustomers(LocalDate fromDate, LocalDate toDate, int limit) {
        String methodName = "getTopCustomers";
        log.info("===== ENTERING METHOD: {} =====", methodName);
        log.info("Input parameters - fromDate: {}, toDate: {}, limit: {}", fromDate, toDate, limit);
        
        try {
            String fromStr = toDateStr(fromDate, "1900-01-01");
            String toStr = toDateStr(toDate, "2100-12-31");
            
            log.info("Converted date strings - fromStr: {}, toStr: {}", fromStr, toStr);
            log.info("Calling repository method: dashboardRepository.topCustomers with params: fromStr={}, toStr={}, limit={}", 
                     fromStr, toStr, limit);
            
            List<Object[]> rows = dashboardRepository.topCustomers(fromStr, toStr, limit);
            
            log.info("Query executed successfully. Number of rows returned: {}", rows != null ? rows.size() : 0);
            
            if (rows == null || rows.isEmpty()) {
                log.info("No top customers found for the given criteria");
                log.info("===== EXITING METHOD: {} =====", methodName);
                return new ArrayList<>();
            }
            
            log.info("Processing {} result rows", rows.size());
            
            List<TopCustomerDto> results = rows.stream().map(row -> {
                TopCustomerDto dto = TopCustomerDto.builder()
                        .customerId(((Number) row[0]).intValue())
                        .customerName((String) row[1])
                        .totalSales(toBigDecimal(row[2]))
                        .invoiceCount(toLong(row[3]))
                        .build();
                
                log.debug("Processed row - customerId: {}, customerName: {}, totalSales: {}, invoiceCount: {}",
                         dto.getCustomerId(), dto.getCustomerName(), dto.getTotalSales(), dto.getInvoiceCount());
                
                return dto;
            }).collect(Collectors.toList());
            
            log.info("Successfully processed {} top customers", results.size());
            log.info("===== EXITING METHOD: {} =====", methodName);
            
            return results;
            
        } catch (Exception e) {
            log.error("===== EXCEPTION IN METHOD: {} =====", methodName, e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public SalesTrendDto getSalesTrend(LocalDate fromDate, LocalDate toDate) {
        String methodName = "getSalesTrend";
        log.info("===== ENTERING METHOD: {} =====", methodName);
        log.info("Input parameters - fromDate: {}, toDate: {}", fromDate, toDate);
        
        try {
            String fromStr = toDateStr(fromDate, "1900-01-01");
            String toStr = toDateStr(toDate, "2100-12-31");
            
            log.info("Converted date strings - fromStr: {}, toStr: {}", fromStr, toStr);
            log.info("Calling repository method: dashboardRepository.salesTrendDaily with params: fromStr={}, toStr={}", fromStr, toStr);

            List<Object[]> rows = dashboardRepository.salesTrendDaily(fromStr, toStr);
            
            log.info("Query executed successfully. Number of rows returned: {}", rows != null ? rows.size() : 0);

            List<SalesTrendDto.SalesTrendRowDto> data = new ArrayList<>();

            if (rows != null && !rows.isEmpty()) {
                log.info("Processing {} sales trend rows", rows.size());
                
                for (Object[] row : rows) {
                    try {
                        LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
                        BigDecimal amount = toBigDecimal(row[1]);
                        Long count = toLong(row[2]);

                        SalesTrendDto.SalesTrendRowDto dto = SalesTrendDto.SalesTrendRowDto.builder()
                                .date(date)
                                .amount(amount)
                                .invoiceCount(count)
                                .build();
                        
                        data.add(dto);
                        
                        log.debug("Processed sales trend - date: {}, amount: {}, invoiceCount: {}", 
                                 date, amount, count);
                    } catch (Exception e) {
                        log.error("Error processing sales trend row: {}", Arrays.toString(row), e);
                    }
                }
            } else {
                log.info("No sales trend data found for the given criteria");
            }

            log.info("Successfully processed {} sales trend records", data.size());
            log.info("===== EXITING METHOD: {} =====", methodName);
            
            return SalesTrendDto.builder().data(data).build();

        } catch (Exception e) {
            log.error("===== EXCEPTION IN METHOD: {} =====", methodName, e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public CashFlowDto getCashFlow(LocalDate fromDate, LocalDate toDate) {
        String methodName = "getCashFlow";
        log.info("===== ENTERING METHOD: {} =====", methodName);
        log.info("Input parameters - fromDate: {}, toDate: {}", fromDate, toDate);
        
        try {
            String fromStr = toDateStr(fromDate, "1900-01-01");
            String toStr = toDateStr(toDate, "2100-12-31");
            
            log.info("Converted date strings - fromStr: {}, toStr: {}", fromStr, toStr);
            log.info("Calling repository method: dashboardRepository.cashFlowTotal with params: fromStr={}, toStr={}", fromStr, toStr);
            
            Object[] totalRow = dashboardRepository.cashFlowTotal(fromStr, toStr);
            
            log.info("Cash flow total query executed successfully");
            log.info("Total result row: {}, length: {}", totalRow != null ? Arrays.toString(totalRow) : "null", 
                     totalRow != null ? totalRow.length : 0);
            
            if (totalRow == null || totalRow.length < 2) {
                log.warn("Cash flow total query returned null or insufficient data");
                return CashFlowDto.builder()
                        .inflows(BigDecimal.ZERO)
                        .outflows(BigDecimal.ZERO)
                        .net(BigDecimal.ZERO)
                        .byAccount(new ArrayList<>())
                        .build();
            }
            
            BigDecimal totalInflows = toBigDecimal(totalRow[0]);
            BigDecimal totalOutflows = toBigDecimal(totalRow[1]);
            BigDecimal net = totalInflows.subtract(totalOutflows);
            
            log.info("Total results - inflows: {}, outflows: {}, net: {}", totalInflows, totalOutflows, net);
            
            log.info("Calling repository method: dashboardRepository.cashFlowByAccount with params: fromStr={}, toStr={}", fromStr, toStr);
            List<Object[]> byAccountRows = dashboardRepository.cashFlowByAccount(fromStr, toStr);
            
            log.info("Cash flow by account query executed successfully. Number of rows: {}", 
                     byAccountRows != null ? byAccountRows.size() : 0);
            
            List<CashFlowDto.CashFlowByAccountDto> byAccount = new ArrayList<>();
            
            if (byAccountRows != null && !byAccountRows.isEmpty()) {
                log.info("Processing {} cash flow by account rows", byAccountRows.size());
                
                for (Object[] row : byAccountRows) {
                    if (row == null || row.length < 5) {
                        log.warn("Skipping invalid row: {}", row != null ? Arrays.toString(row) : "null");
                        continue;
                    }
                    
                    try {
                        BigDecimal in = toBigDecimal(row[3]);
                        BigDecimal out = toBigDecimal(row[4]);
                        
                        CashFlowDto.CashFlowByAccountDto dto = CashFlowDto.CashFlowByAccountDto.builder()
                                .accountId(((Number) row[0]).intValue())
                                .accountCode((String) row[1])
                                .accountName((String) row[2])
                                .inflows(in)
                                .outflows(out)
                                .net(in.subtract(out))
                                .build();
                        
                        byAccount.add(dto);
                        
                        log.debug("Processed account - id: {}, code: {}, name: {}, inflows: {}, outflows: {}, net: {}",
                                 dto.getAccountId(), dto.getAccountCode(), dto.getAccountName(), 
                                 in, out, dto.getNet());
                    } catch (Exception e) {
                        log.error("Error processing cash flow by account row: {}", Arrays.toString(row), e);
                    }
                }
            }
            
            log.info("Successfully processed {} cash flow by account records", byAccount.size());
            log.info("===== EXITING METHOD: {} =====", methodName);
            
            return CashFlowDto.builder()
                    .inflows(totalInflows)
                    .outflows(totalOutflows)
                    .net(net)
                    .byAccount(byAccount)
                    .build();
                    
        } catch (Exception e) {
            log.error("===== EXCEPTION IN METHOD: {} =====", methodName, e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<StockAlertDto> getStockAlerts() {
        String methodName = "getStockAlerts";
        log.info("===== ENTERING METHOD: {} =====", methodName);
        
        try {
            log.info("Calling repository method: dashboardRepository.stockAlerts with no parameters");
            
            List<Object[]> rows = dashboardRepository.stockAlerts();
            
            log.info("Query executed successfully. Number of rows returned: {}", rows != null ? rows.size() : 0);
            
            if (rows == null || rows.isEmpty()) {
                log.info("No stock alerts found");
                log.info("===== EXITING METHOD: {} =====", methodName);
                return new ArrayList<>();
            }
            
            log.info("Processing {} stock alert rows", rows.size());
            
            List<StockAlertDto> results = rows.stream().map(row -> {
                StockAlertDto dto = StockAlertDto.builder()
                        .productId(((Number) row[0]).intValue())
                        .productCode((String) row[1])
                        .productName((String) row[2])
                        .currentStock(toBigDecimal(row[3]))
                        .minStockLevel(row[4] != null ? ((Number) row[4]).intValue() : 0)
                        .build();
                
                log.debug("Processed stock alert - productId: {}, productCode: {}, productName: {}, currentStock: {}, minStockLevel: {}",
                         dto.getProductId(), dto.getProductCode(), dto.getProductName(), 
                         dto.getCurrentStock(), dto.getMinStockLevel());
                
                return dto;
            }).collect(Collectors.toList());
            
            log.info("Successfully processed {} stock alerts", results.size());
            log.info("===== EXITING METHOD: {} =====", methodName);
            
            return results;
            
        } catch (Exception e) {
            log.error("===== EXCEPTION IN METHOD: {} =====", methodName, e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public CashCreditRatioDto getCashCreditRatio(LocalDate fromDate, LocalDate toDate) {
        String methodName = "getCashCreditRatio";
        log.info("===== ENTERING METHOD: {} =====", methodName);
        log.info("Input parameters - fromDate: {}, toDate: {}", fromDate, toDate);
        
        try {
            String fromStr = toDateStr(fromDate, "1900-01-01");
            String toStr = toDateStr(toDate, "2100-12-31");
            
            log.info("Converted date strings - fromStr: {}, toStr: {}", fromStr, toStr);
            log.info("Calling repository method: dashboardRepository.cashCreditRatio with params: fromStr={}, toStr={}", fromStr, toStr);
            
            Object[] row = dashboardRepository.cashCreditRatio(fromStr, toStr);
            
            log.info("Query executed successfully");
            log.info("Result row: {}, length: {}", row != null ? Arrays.toString(row) : "null", 
                     row != null ? row.length : 0);
            
            if (row == null || row.length < 2) {
                log.warn("Query returned null or insufficient data. row is null: {}, row length < 2: {}", 
                         row == null, row != null && row.length < 2);
                return CashCreditRatioDto.builder()
                        .cashSalesTotal(BigDecimal.ZERO)
                        .creditSalesTotal(BigDecimal.ZERO)
                        .cashRatio(BigDecimal.ZERO)
                        .creditRatio(BigDecimal.ZERO)
                        .build();
            }
            
            BigDecimal cashTotal = toBigDecimal(row[0]);
            BigDecimal creditTotal = toBigDecimal(row[1]);
            BigDecimal total = cashTotal.add(creditTotal);
            
            BigDecimal cashRatio = total.compareTo(BigDecimal.ZERO) > 0
                    ? cashTotal.divide(total, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            BigDecimal creditRatio = total.compareTo(BigDecimal.ZERO) > 0
                    ? creditTotal.divide(total, 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            
            log.info("Processed results - cashTotal: {}, creditTotal: {}, total: {}, cashRatio: {}, creditRatio: {}", 
                     cashTotal, creditTotal, total, cashRatio, creditRatio);
            log.info("===== EXITING METHOD: {} =====", methodName);
            
            return CashCreditRatioDto.builder()
                    .cashSalesTotal(cashTotal)
                    .creditSalesTotal(creditTotal)
                    .cashRatio(cashRatio)
                    .creditRatio(creditRatio)
                    .build();
                    
        } catch (Exception e) {
            log.error("===== EXCEPTION IN METHOD: {} =====", methodName, e);
            throw e;
        }
    }
}