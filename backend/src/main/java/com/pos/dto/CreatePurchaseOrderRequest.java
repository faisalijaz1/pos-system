package com.pos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreatePurchaseOrderRequest {

    @NotNull(message = "Order number is required")
    private String orderNumber;

    @NotNull(message = "Supplier ID is required")
    private Integer supplierId;

    @NotNull(message = "Order date is required")
    private LocalDate orderDate;

    private String remarks;

    @NotNull(message = "Items are required")
    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<CreatePurchaseOrderItemRequest> items;
}
