package com.pos.dto;

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
public class InvoiceSummaryDto {

    private Integer salesInvoiceId;
    private String invoiceNumber;
    private Integer customerId;
    private String customerName;
    private LocalDate invoiceDate;
    private BigDecimal netTotal;
    private BigDecimal amountReceived;
}
