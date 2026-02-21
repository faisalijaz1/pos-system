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
public class ProductSummaryDto {

    private Integer productId;
    private String code;
    private String nameEn;
    private String nameUr;
    private Integer uomId;
    private String uomName;
    private BigDecimal currentStock;
    private BigDecimal sellingPrice;
    private BigDecimal costPrice;
}
