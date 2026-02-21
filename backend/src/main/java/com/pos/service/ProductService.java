package com.pos.service;

import com.pos.domain.Product;
import com.pos.dto.ProductSummaryDto;
import com.pos.exception.ResourceNotFoundException;
import com.pos.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Page<ProductSummaryDto> findAll(String name, Pageable pageable) {
        Page<Product> page = name != null && !name.isBlank()
                ? productRepository.findByDeletedAtIsNullAndNameEnContainingIgnoreCase(name.trim(), pageable)
                : productRepository.findByDeletedAtIsNull(pageable);
        return page.map(this::toSummaryDto);
    }

    @Transactional(readOnly = true)
    public ProductSummaryDto findById(Integer id) {
        Product p = productRepository.findByProductIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return toSummaryDto(p);
    }

    private ProductSummaryDto toSummaryDto(Product p) {
        var uom = p.getUom();
        return ProductSummaryDto.builder()
                .productId(p.getProductId())
                .code(p.getCode())
                .nameEn(p.getNameEn())
                .nameUr(p.getNameUr())
                .uomId(uom != null ? uom.getUomId() : null)
                .uomName(uom != null ? uom.getName() : null)
                .currentStock(p.getCurrentStock())
                .sellingPrice(p.getSellingPrice())
                .costPrice(p.getCostPrice())
                .build();
    }
}
