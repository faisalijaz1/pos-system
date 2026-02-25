package com.pos.dto;

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
public class ProductSummaryDto {

    private Integer productId;
    private String code;
    private String nameEn;
    private String nameUr;
    private Integer uomId;
    private String uomName;
    private String brandName;
    private BigDecimal currentStock;
    private BigDecimal sellingPrice;
    private BigDecimal costPrice;
    /** Price per UOM for this product. Used when changing unit in POS to show correct price. */
    private List<ProductUomPriceDto> uomPrices;
}
