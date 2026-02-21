package com.pos.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfitDto {

    private BigDecimal revenue;
    private BigDecimal cost;
    private BigDecimal profit;
    private BigDecimal marginPercent;
}
