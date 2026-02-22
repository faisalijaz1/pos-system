package com.pos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class CreateInvoiceRequest {

    @NotNull(message = "Invoice number is required")
    private String invoiceNumber;

    private Integer branchId;
    private Integer customerId;

    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate;

    private LocalTime invoiceTime;

    @NotNull(message = "Transaction type is required (e.g. SALE)")
    private String transactionTypeCode;

    private Integer deliveryModeId;
    private Boolean isCashCustomer = false;

    @NotNull(message = "Items are required")
    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<CreateInvoiceItemRequest> items;

    @DecimalMin(value = "0", message = "Additional discount must be non-negative")
    private BigDecimal additionalDiscount = BigDecimal.ZERO;

    @DecimalMin(value = "0", message = "Additional expenses must be non-negative")
    private BigDecimal additionalExpenses = BigDecimal.ZERO;

    @DecimalMin(value = "0", message = "Amount received must be non-negative")
    private BigDecimal amountReceived = BigDecimal.ZERO;

    @DecimalMin(value = "0", message = "Change returned must be non-negative")
    private BigDecimal changeReturned = BigDecimal.ZERO;

    private Boolean saveAsDraft = false;

    private Boolean printWithoutHeader = false;
    private Boolean printWithoutBalance = false;

    private String remarks;
    private String billingNo;
    private LocalDate billingDate;
    private String billingPacking;
    private String billingAdda;
}
