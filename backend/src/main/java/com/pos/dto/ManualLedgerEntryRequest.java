package com.pos.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ManualLedgerEntryRequest {

    @NotNull(message = "Voucher number is required")
    private String voucherNo;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    @NotNull(message = "Description is required")
    private String description;

    @NotNull(message = "Debit account is required")
    private Integer debitAccountId;

    @NotNull(message = "Credit account is required")
    private Integer creditAccountId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.000001", message = "Amount must be positive")
    private BigDecimal amount;

    private String refType;
    private Long refId;
}
