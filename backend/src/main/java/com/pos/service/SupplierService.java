package com.pos.service;

import com.pos.domain.Supplier;
import com.pos.dto.SupplierSummaryDto;
import com.pos.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public List<SupplierSummaryDto> findAllActive() {
        return supplierRepository.findByDeletedAtIsNullOrderByNameAsc().stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    private SupplierSummaryDto toSummary(Supplier s) {
        return SupplierSummaryDto.builder()
                .supplierId(s.getSupplierId())
                .supplierCode(s.getSupplierCode())
                .name(s.getName())
                .mobile(s.getMobile())
                .build();
    }
}
