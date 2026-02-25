package com.pos.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Request to update quantity/price of an existing invoice line item.
 */
@Data
public class UpdateInvoiceItemRequest {

    @DecimalMin(value = "0.0001", message = "Quantity must be positive")
    private BigDecimal quantity;

    @DecimalMin(value = "0", message = "Unit price must be non-negative")
    private BigDecimal unitPrice;
}
