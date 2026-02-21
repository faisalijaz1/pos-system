package com.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {

    private Integer salesInvoiceId;
    private String invoiceNumber;
    private Integer branchId;
    private Integer customerId;
    private String customerName;
    private Integer userId;
    private String userName;
    private LocalDate invoiceDate;
    private LocalTime invoiceTime;
    private String transactionTypeCode;
    private Integer deliveryModeId;
    private Boolean isCashCustomer;
    private BigDecimal grandTotal;
    private BigDecimal additionalDiscount;
    private BigDecimal additionalExpenses;
    private BigDecimal netTotal;
    private BigDecimal amountReceived;
    private String remarks;
    private String billingNo;
    private LocalDate billingDate;
    private String billingPacking;
    private String billingAdda;
    private Instant createdAt;
    private List<InvoiceItemResponse> items;
}
