package com.pos.service;

import com.pos.dto.dashboard.*;
import com.pos.repository.DashboardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private DashboardRepository dashboardRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @BeforeEach
    void setUp() {
        // default: no args matchers
    }

    @Test
    void getTodaySales_returnsDtoFromRepository() {
        LocalDate today = LocalDate.now();
        LocalDate from = today;
        LocalDate to = today;

        when(dashboardRepository.todaySales(eq(from), eq(to)))
                .thenReturn(new Object[]{ new BigDecimal("15000.00"), 5L });

        TodaySalesDto result = dashboardService.getTodaySales(today, today);

        assertThat(result.getTotalSales()).isEqualByComparingTo("15000.00");
        assertThat(result.getInvoiceCount()).isEqualTo(5L);
    }

    @Test
    void getTodaySales_handlesNullSums() {
        when(dashboardRepository.todaySales(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(new Object[]{ null, null });

        TodaySalesDto result = dashboardService.getTodaySales(LocalDate.now(), LocalDate.now());

        assertThat(result.getTotalSales()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getInvoiceCount()).isEqualTo(0L);
    }

    @Test
    void getMonthToDate_returnsDtoFromRepository() {
        LocalDate fromDay = LocalDate.now().withDayOfMonth(1);
        LocalDate toDay = LocalDate.now();
        LocalDateTime from = fromDay.atStartOfDay();
        LocalDateTime to = toDay.atTime(LocalTime.MAX);
        when(dashboardRepository.monthToDateSales(eq(from), eq(to)))
                .thenReturn(new Object[]{ new BigDecimal("120000.00"), 42L });

        MonthToDateDto result = dashboardService.getMonthToDate(fromDay, toDay);

        assertThat(result.getTotalSales()).isEqualByComparingTo("120000.00");
        assertThat(result.getInvoiceCount()).isEqualTo(42L);
        assertThat(result.getFromDate()).isEqualTo(fromDay);
        assertThat(result.getToDate()).isEqualTo(toDay);
    }

    @Test
    void getProfit_computesMarginCorrectly() {
        when(dashboardRepository.profitAggregate(any(String.class), any(String.class)))
                .thenReturn(new Object[]{ new BigDecimal("1000.00"), new BigDecimal("600.00") });

        ProfitDto result = dashboardService.getProfit(LocalDate.now().minusDays(30), LocalDate.now());

        assertThat(result.getRevenue()).isEqualByComparingTo("1000.00");
        assertThat(result.getCost()).isEqualByComparingTo("600.00");
        assertThat(result.getProfit()).isEqualByComparingTo("400.00");
        assertThat(result.getMarginPercent()).isEqualByComparingTo("40.00");
    }

    @Test
    void getProfit_zeroRevenue_returnsZeroMargin() {
        when(dashboardRepository.profitAggregate(any(String.class), any(String.class)))
                .thenReturn(new Object[]{ BigDecimal.ZERO, BigDecimal.ZERO });

        ProfitDto result = dashboardService.getProfit(null, null);

        assertThat(result.getMarginPercent()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void getBestSellingProducts_mapsRowsToDtos() {
        when(dashboardRepository.bestSellingProducts(any(String.class), any(String.class), eq(10)))
                .thenReturn(Collections.singletonList(
                        new Object[]{ 1, "P001", "Product A", new BigDecimal("100"), new BigDecimal("5000.00") }
                ));

        List<BestSellingProductDto> result = dashboardService.getBestSellingProducts(
                LocalDate.now().minusDays(7), LocalDate.now(), 10);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProductId()).isEqualTo(1);
        assertThat(result.get(0).getProductCode()).isEqualTo("P001");
        assertThat(result.get(0).getQuantitySold()).isEqualByComparingTo("100");
        assertThat(result.get(0).getRevenue()).isEqualByComparingTo("5000.00");
    }

    @Test
    void getTopCustomers_mapsRowsToDtos() {
        when(dashboardRepository.topCustomers(any(String.class), any(String.class), eq(5)))
                .thenReturn(Collections.singletonList(
                        new Object[]{ 10, "Customer X", new BigDecimal("25000.00"), 8L }
                ));

        List<TopCustomerDto> result = dashboardService.getTopCustomers(null, null, 5);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCustomerId()).isEqualTo(10);
        assertThat(result.get(0).getCustomerName()).isEqualTo("Customer X");
        assertThat(result.get(0).getTotalSales()).isEqualByComparingTo("25000.00");
        assertThat(result.get(0).getInvoiceCount()).isEqualTo(8L);
    }

    @Test
    void getSalesTrend_mapsDailyRows() {
        LocalDate d = LocalDate.now().minusDays(1);
        when(dashboardRepository.salesTrendDaily(any(String.class), any(String.class)))
                .thenReturn(Collections.singletonList(new Object[]{ java.sql.Date.valueOf(d), new BigDecimal("3000.00"), 2L }));

        SalesTrendDto result = dashboardService.getSalesTrend(LocalDate.now().minusDays(7), LocalDate.now());

        assertThat(result.getData()).hasSize(1);
        assertThat(result.getData().get(0).getDate()).isEqualTo(d);
        assertThat(result.getData().get(0).getAmount()).isEqualByComparingTo("3000.00");
        assertThat(result.getData().get(0).getInvoiceCount()).isEqualTo(2L);
    }

    @Test
    void getCashFlow_aggregatesInflowsOutflows() {
        when(dashboardRepository.cashFlowTotal(any(String.class), any(String.class)))
                .thenReturn(new Object[]{ new BigDecimal("50000.00"), new BigDecimal("20000.00") });
        when(dashboardRepository.cashFlowByAccount(any(String.class), any(String.class)))
                .thenReturn(Collections.singletonList(
                        new Object[]{ 1, "CASH01", "Cash", new BigDecimal("50000.00"), new BigDecimal("20000.00") }
                ));

        CashFlowDto result = dashboardService.getCashFlow(LocalDate.now().minusMonths(1), LocalDate.now());

        assertThat(result.getInflows()).isEqualByComparingTo("50000.00");
        assertThat(result.getOutflows()).isEqualByComparingTo("20000.00");
        assertThat(result.getNet()).isEqualByComparingTo("30000.00");
        assertThat(result.getByAccount()).hasSize(1);
        assertThat(result.getByAccount().get(0).getAccountCode()).isEqualTo("CASH01");
        assertThat(result.getByAccount().get(0).getNet()).isEqualByComparingTo("30000.00");
    }

    @Test
    void getStockAlerts_mapsRowsToDtos() {
        when(dashboardRepository.stockAlerts())
                .thenReturn(Collections.singletonList(
                        new Object[]{ 1, "P001", "Product A", new BigDecimal("5"), 10 }
                ));

        List<StockAlertDto> result = dashboardService.getStockAlerts();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProductId()).isEqualTo(1);
        assertThat(result.get(0).getCurrentStock()).isEqualByComparingTo("5");
        assertThat(result.get(0).getMinStockLevel()).isEqualTo(10);
    }

    @Test
    void getCashCreditRatio_computesRatios() {
        when(dashboardRepository.cashCreditRatio(any(String.class), any(String.class)))
                .thenReturn(new Object[]{ new BigDecimal("60.00"), new BigDecimal("40.00") });

        CashCreditRatioDto result = dashboardService.getCashCreditRatio(
                LocalDate.now().withDayOfMonth(1), LocalDate.now());

        assertThat(result.getCashSalesTotal()).isEqualByComparingTo("60.00");
        assertThat(result.getCreditSalesTotal()).isEqualByComparingTo("40.00");
        assertThat(result.getCashRatio()).isEqualByComparingTo("0.6000");
        assertThat(result.getCreditRatio()).isEqualByComparingTo("0.4000");
    }
}
