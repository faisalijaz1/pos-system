package com.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountSummaryDto {

    private Integer accountId;
    private String accountCode;
    private String accountName;
    private String accountType;
    private BigDecimal currentBalance;
    private String balanceType;
}
