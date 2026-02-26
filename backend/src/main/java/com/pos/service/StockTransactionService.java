package com.pos.service;

import com.pos.domain.*;
import com.pos.dto.*;
import com.pos.exception.BadRequestException;
import com.pos.exception.ResourceNotFoundException;
import com.pos.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockTransactionService {

    private static final String TYPE_STOCK_IN = "STOCK_IN";
    private static final String TYPE_STOCK_OUT = "STOCK_OUT";

    private final StockTransactionRepository stockTransactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final BranchRepository branchRepository;
    private final UnitOfMeasureRepository unitOfMeasureRepository;

    @Transactional(rollbackFor = Exception.class)
    public StockMovementResponse stockIn(StockInRequest request, String username) {
        TransactionType type = transactionTypeRepository.findByTypeCode(TYPE_STOCK_IN)
                .orElseThrow(() -> new BadRequestException("Transaction type STOCK_IN not found. Run seed data."));
        return performStockMovement(request.getBranchId(), request.getTransactionDate(), request.getDescription(),
                request.getItems(), type, username, true, null, null);
    }

    @Transactional(rollbackFor = Exception.class)
    public StockMovementResponse stockOut(StockOutRequest request, String username) {
        TransactionType type = transactionTypeRepository.findByTypeCode(TYPE_STOCK_OUT)
                .orElseThrow(() -> new BadRequestException("Transaction type STOCK_OUT not found. Run seed data."));
        return performStockMovement(request.getBranchId(), request.getTransactionDate(), request.getDescription(),
                request.getItems(), type, username, false, null, null);
    }

    @Transactional(rollbackFor = Exception.class)
    public StockMovementResponse performStockMovement(
            Integer branchId,
            java.time.LocalDate transactionDate,
            String description,
            List<StockMovementItemRequest> items,
            TransactionType type,
            String username,
            boolean isIn,
            SalesInvoice refSalesInvoice,
            PurchaseOrder refPurchaseOrder
    ) {
        User user = username != null ? userRepository.findByUsernameAndDeletedAtIsNull(username).orElse(null) : null;
        Branch branch = branchId != null ? branchRepository.findById(branchId).orElse(null) : null;

        String recordNo = (isIn ? "ST-IN-" : "ST-OUT-") + UUID.randomUUID().toString().substring(0, 8);
        while (stockTransactionRepository.existsByRecordNo(recordNo)) {
            recordNo = (isIn ? "ST-IN-" : "ST-OUT-") + UUID.randomUUID().toString().substring(0, 8);
        }

        List<StockTransactionItem> entityItems = new ArrayList<>();
        BigDecimal multiplier = isIn ? BigDecimal.ONE : BigDecimal.ONE.negate();

        for (StockMovementItemRequest req : items) {
            Product product = productRepository.findByIdForUpdate(req.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", req.getProductId()));
            if (product.getDeletedAt() != null) {
                throw new ResourceNotFoundException("Product", req.getProductId());
            }

            BigDecimal qty = req.getQuantity();
            if (!isIn && product.getCurrentStock().compareTo(qty) < 0) {
                throw new BadRequestException(
                        "Insufficient stock for product " + product.getCode() + ". Available: " + product.getCurrentStock() + ", requested: " + qty);
            }

            BigDecimal quantityChange = qty.multiply(multiplier);
            product.setCurrentStock(product.getCurrentStock().add(quantityChange));
            productRepository.save(product);

            StockTransactionItem sti = StockTransactionItem.builder()
                    .product(product)
                    .quantityChange(quantityChange)
                    .priceAtTransaction(req.getPriceAtTransaction())
                    .uom(req.getUomId() != null ? unitOfMeasureRepository.findById(req.getUomId()).orElse(null) : null)
                    .build();
            entityItems.add(sti);
        }

        StockTransaction st = StockTransaction.builder()
                .recordNo(recordNo)
                .branch(branch)
                .transactionDate(transactionDate)
                .transactionType(type)
                .description(description != null ? description : (isIn ? "Stock In" : "Stock Out"))
                .user(user)
                .refSalesInvoice(refSalesInvoice)
                .refPurchaseOrder(refPurchaseOrder)
                .build();
        for (StockTransactionItem it : entityItems) {
            it.setStockTransaction(st);
            st.getItems().add(it);
        }
        stockTransactionRepository.saveAndFlush(st);
        return toResponse(st);
    }

    @Transactional(readOnly = true)
    public Page<StockMovementResponse> getMovements(java.time.LocalDate fromDate, java.time.LocalDate toDate, Integer productId, Pageable pageable) {
        Page<StockTransaction> page = stockTransactionRepository.findByDateRangeAndProduct(fromDate, toDate, productId, pageable);
        return page.map(this::toResponse);
    }

    private StockMovementResponse toResponse(StockTransaction st) {
        List<StockMovementItemDto> itemDtos = new ArrayList<>();
        for (StockTransactionItem it : st.getItems()) {
            Product p = it.getProduct();
            itemDtos.add(StockMovementItemDto.builder()
                    .stockTransactionItemId(it.getStockTransactionItemId())
                    .productId(p.getProductId())
                    .productCode(p.getCode())
                    .productName(p.getNameEn())
                    .quantityChange(it.getQuantityChange())
                    .priceAtTransaction(it.getPriceAtTransaction())
                    .build());
        }
        String refType = null;
        Long refId = null;
        if (st.getRefSalesInvoice() != null) {
            refType = "SALE";
            refId = st.getRefSalesInvoice().getSalesInvoiceId().longValue();
        } else if (st.getRefPurchaseOrder() != null) {
            refType = "PURCHASE";
            refId = st.getRefPurchaseOrder().getPurchaseOrderId().longValue();
        }
        return StockMovementResponse.builder()
                .stockTransactionId(st.getStockTransactionId())
                .recordNo(st.getRecordNo())
                .branchId(st.getBranch() != null ? st.getBranch().getBranchId() : null)
                .transactionDate(st.getTransactionDate())
                .transactionTypeCode(st.getTransactionType().getTypeCode())
                .description(st.getDescription())
                .userId(st.getUser() != null ? st.getUser().getUserId() : null)
                .userName(st.getUser() != null ? (st.getUser().getFullName() != null ? st.getUser().getFullName() : st.getUser().getUsername()) : null)
                .refType(refType)
                .refId(refId)
                .createdAt(st.getCreatedAt())
                .items(itemDtos)
                .build();
    }
}
