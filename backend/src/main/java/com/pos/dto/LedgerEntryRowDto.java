package com.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerEntryRowDto {

    private Integer ledgerEntryId;
    private String voucherNo;
    private LocalDate transactionDate;
    private String description;
    private BigDecimal debitAmount;
    private BigDecimal creditAmount;
    /** Running balance after this entry (for the selected account in the date range). */
    private BigDecimal runningBalance;
    /** "Dr" or "Cr" for the running balance. */
    private String balanceType;
}
