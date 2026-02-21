package com.pos.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashFlowDto {

    private BigDecimal inflows;
    private BigDecimal outflows;
    private BigDecimal net;
    private List<CashFlowByAccountDto> byAccount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CashFlowByAccountDto {
        private Integer accountId;
        private String accountCode;
        private String accountName;
        private BigDecimal inflows;
        private BigDecimal outflows;
        private BigDecimal net;
    }
}
