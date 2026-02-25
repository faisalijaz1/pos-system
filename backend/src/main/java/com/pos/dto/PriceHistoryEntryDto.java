package com.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceHistoryEntryDto {

    private LocalDate invoiceDate;
    private LocalTime invoiceTime;
    private String invoiceNumber;
    private BigDecimal unitPrice;
    private BigDecimal quantity;
    private String uomName;
}
