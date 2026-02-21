package com.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponse {

    private Integer stockTransactionId;
    private String recordNo;
    private Integer branchId;
    private LocalDate transactionDate;
    private String transactionTypeCode;
    private String description;
    private Integer userId;
    private String userName;
    private String refType;
    private Long refId;
    private Instant createdAt;
    private List<StockMovementItemDto> items;
}
