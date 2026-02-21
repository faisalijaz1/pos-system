package com.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerEntryDto {

    private Integer ledgerEntryId;
    private String voucherNo;
    private Integer accountId;
    private String accountCode;
    private String accountName;
    private LocalDate transactionDate;
    private String description;
    private BigDecimal debitAmount;
    private BigDecimal creditAmount;
    private String refType;
    private Long refId;
    private Integer createdBy;
    private Instant createdAt;
}
