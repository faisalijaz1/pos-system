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
public class CustomerSummaryDto {

    private Integer customerId;
    private String customerCode;
    private String name;
    private String nameEnglish;
    private String mobile;
    private String city;
    private BigDecimal creditLimit;
    private LocalDate joiningDate;
    private BigDecimal currentBalance;
}
