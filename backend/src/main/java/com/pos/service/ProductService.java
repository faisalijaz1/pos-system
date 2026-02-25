package com.pos.service;

import com.pos.domain.SalesInvoiceItem;
import com.pos.domain.Product;
import com.pos.domain.ProductUomPrice;
import com.pos.domain.UnitOfMeasure;
import com.pos.dto.LastSaleDto;
import com.pos.dto.PriceHistoryEntryDto;
import com.pos.dto.ProductSummaryDto;
import com.pos.dto.ProductUomPriceDto;
import com.pos.exception.ResourceNotFoundException;
import com.pos.repository.ProductRepository;
import com.pos.repository.ProductUomPriceRepository;
import com.pos.repository.SalesInvoiceItemRepository;
import com.pos.repository.UnitOfMeasureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductUomPriceRepository productUomPriceRepository;
    private final UnitOfMeasureRepository unitOfMeasureRepository;
    private final SalesInvoiceItemRepository salesInvoiceItemRepository;

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

    @Transactional(readOnly = true)
    public List<ProductSummaryDto> findByIds(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) return List.of();
        List<Product> products = productRepository.findByProductIdInAndDeletedAtIsNull(ids);
        return products.stream().map(this::toSummaryDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<LastSaleDto> getLastSale(Integer productId, Integer customerId) {
        var list = salesInvoiceItemRepository.findLastSaleByProductAndOptionalCustomer(
                productId, customerId, PageRequest.of(0, 1));
        if (list.isEmpty()) return Optional.empty();
        SalesInvoiceItem item = list.get(0);
        var inv = item.getSalesInvoice();
        return Optional.of(LastSaleDto.builder()
                .invoiceNumber(inv.getInvoiceNumber())
                .invoiceDate(inv.getInvoiceDate())
                .invoiceTime(inv.getInvoiceTime())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .uomName(item.getUom() != null ? item.getUom().getName() : null)
                .build());
    }

    @Transactional(readOnly = true)
    public List<PriceHistoryEntryDto> getPriceHistory(Integer productId, int limit) {
        if (productId == null) return List.of();
        var list = salesInvoiceItemRepository.findPriceHistoryByProduct(productId, PageRequest.of(0, Math.min(limit, 50)));
        return list.stream()
                .map(item -> {
                    var inv = item.getSalesInvoice();
                    return PriceHistoryEntryDto.builder()
                            .invoiceDate(inv.getInvoiceDate())
                            .invoiceTime(inv.getInvoiceTime())
                            .invoiceNumber(inv.getInvoiceNumber())
                            .unitPrice(item.getUnitPrice())
                            .quantity(item.getQuantity())
                            .uomName(item.getUom() != null ? item.getUom().getName() : null)
                            .build();
                })
                .toList();
    }

    private ProductSummaryDto toSummaryDto(Product p) {
        var uom = p.getUom();
        var brand = p.getBrand();
        List<ProductUomPriceDto> uomPrices = buildUomPrices(p);
        BigDecimal sellingPrice = p.getSellingPrice();
        if (uom != null && uomPrices != null) {
            sellingPrice = uomPrices.stream()
                    .filter(u -> u.getUomId() != null && u.getUomId().equals(uom.getUomId()))
                    .findFirst()
                    .map(ProductUomPriceDto::getPrice)
                    .orElse(sellingPrice);
        }
        return ProductSummaryDto.builder()
                .productId(p.getProductId())
                .code(p.getCode())
                .nameEn(p.getNameEn())
                .nameUr(p.getNameUr())
                .uomId(uom != null ? uom.getUomId() : null)
                .uomName(uom != null ? uom.getName() : null)
                .brandName(brand != null ? brand.getName() : null)
                .currentStock(p.getCurrentStock())
                .sellingPrice(sellingPrice)
                .costPrice(p.getCostPrice())
                .uomPrices(uomPrices)
                .build();
    }

    private List<ProductUomPriceDto> buildUomPrices(Product p) {
        List<UnitOfMeasure> allUoms = unitOfMeasureRepository.findAll();
        List<ProductUomPrice> productPrices = productUomPriceRepository.findByProductIdOrderByUomId(p.getProductId());
        Map<Integer, BigDecimal> priceByUomId = productPrices.stream()
                .collect(Collectors.toMap(ProductUomPrice::getUomId, ProductUomPrice::getPrice, (a, b) -> a));
        BigDecimal defaultPrice = p.getSellingPrice() != null ? p.getSellingPrice() : BigDecimal.ZERO;
        return allUoms.stream()
                .map(u -> {
                    BigDecimal price = priceByUomId.containsKey(u.getUomId())
                            ? priceByUomId.get(u.getUomId())
                            : defaultPrice;
                    return ProductUomPriceDto.builder()
                            .uomId(u.getUomId())
                            .uomName(u.getName())
                            .price(price)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
