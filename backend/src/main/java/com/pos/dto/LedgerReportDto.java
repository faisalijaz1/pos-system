package com.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerReportDto {

    private AccountSummaryDto account;
    private LocalDate fromDate;
    private LocalDate toDate;
    /** Opening balance for the account as of (fromDate - 1 day). */
    private BigDecimal openingBalance;
    private String openingBalanceType; // "Dr" or "Cr"
    private List<LedgerEntryRowDto> entries;
    private BigDecimal totalDr;
    private BigDecimal totalCr;
    private BigDecimal closingBalance;
    private String closingBalanceType; // "Dr" or "Cr"
    private long totalElements;
    private int totalPages;
    private int number; // current page 0-based
}
