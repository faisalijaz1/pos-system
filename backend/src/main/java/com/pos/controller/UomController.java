package com.pos.controller;

import com.pos.domain.UnitOfMeasure;
import com.pos.dto.UomSummaryDto;
import com.pos.repository.UnitOfMeasureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/uom")
@RequiredArgsConstructor
public class UomController {

    private final UnitOfMeasureRepository unitOfMeasureRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<List<UomSummaryDto>> list() {
        List<UomSummaryDto> list = unitOfMeasureRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    private UomSummaryDto toDto(UnitOfMeasure u) {
        return UomSummaryDto.builder()
                .uomId(u.getUomId())
                .name(u.getName())
                .symbol(u.getSymbol())
                .build();
    }
}
