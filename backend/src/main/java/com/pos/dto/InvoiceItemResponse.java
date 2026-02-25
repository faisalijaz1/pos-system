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
public class InvoiceItemResponse {

    private Integer salesInvoiceItemId;
    private Integer productId;
    private String productCode;
    private String productName;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
    private Integer uomId;
    private String uomName;
    private String brandName;
    private Integer sortOrder;
}
