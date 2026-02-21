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
public class BestSellingProductDto {

    private Integer productId;
    private String productCode;
    private String productName;
    private BigDecimal quantitySold;
    private BigDecimal revenue;
}
