package com.pos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class StockInRequest {

    private Integer branchId;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    private String description;

    @NotNull(message = "Items are required")
    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<StockMovementItemRequest> items;
}
