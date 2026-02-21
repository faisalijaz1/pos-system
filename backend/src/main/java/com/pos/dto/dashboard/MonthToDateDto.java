package com.pos.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthToDateDto {

    private BigDecimal totalSales;
    private Long invoiceCount;
    private LocalDate fromDate;
    private LocalDate toDate;
}
