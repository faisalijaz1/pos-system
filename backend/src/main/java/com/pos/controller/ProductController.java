package com.pos.controller;

import com.pos.dto.LastSaleDto;
import com.pos.dto.ProductSummaryDto;
import com.pos.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<Page<ProductSummaryDto>> list(
            @RequestParam(required = false) String name,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<ProductSummaryDto> page = productService.findAll(name, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<ProductSummaryDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @GetMapping("/{id}/last-sale")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<LastSaleDto> getLastSale(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer customerId
    ) {
        Optional<LastSaleDto> lastSale = productService.getLastSale(id, customerId);
        return lastSale.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }
}
