package com.pos.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Request to add a line item to an existing invoice (Sales History edit mode).
 */
@Data
public class AddInvoiceItemRequest {

    @NotNull(message = "Product ID is required")
    private Integer productId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0001", message = "Quantity must be positive")
    private BigDecimal quantity;

    private BigDecimal unitPrice; // optional; if null use product selling price
    private Integer uomId;         // optional; if null use product UOM
}
