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
public class LastSaleDto {

    private String invoiceNumber;
    private LocalDate invoiceDate;
    private LocalTime invoiceTime;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private String uomName;
}
