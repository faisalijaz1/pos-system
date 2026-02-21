package com.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {

    private Integer purchaseOrderId;
    private String orderNumber;
    private Integer supplierId;
    private String supplierName;
    private Integer userId;
    private String userName;
    private LocalDate orderDate;
    private BigDecimal totalAmount;
    private String status;
    private String remarks;
    private Instant createdAt;
    private List<PurchaseOrderItemDto> items;
}
