package com.pos.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request body for updating an existing sales invoice (header, billing, print options).
 * Used by Sales History tab for Edit/Modify.
 */
@Data
public class UpdateInvoiceRequest {

    private LocalDate invoiceDate;
    private LocalTime invoiceTime;
    private Integer deliveryModeId;

    @DecimalMin(value = "0", message = "Additional discount must be non-negative")
    private BigDecimal additionalDiscount;

    @DecimalMin(value = "0", message = "Additional expenses must be non-negative")
    private BigDecimal additionalExpenses;

    private Boolean printWithoutHeader;
    private Boolean printWithoutBalance;
    private String remarks;
    private String billingNo;
    private LocalDate billingDate;
    private String billingPacking;
    private String billingAdda;
}
