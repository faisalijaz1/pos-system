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

@Service
@RequiredArgsConstructor
@Slf4j
public class PurchaseOrderService {

    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_RECEIVED = "RECEIVED";
    private static final String ACCOUNT_TYPE_INVENTORY = "Inventory";
    private static final String REF_TYPE_PURCHASE = "PURCHASE";

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final UnitOfMeasureRepository unitOfMeasureRepository;
    private final AccountRepository accountRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final StockTransactionService stockTransactionService;
    private final LedgerService ledgerService;

    @Transactional(rollbackFor = Exception.class)
    public PurchaseOrderResponse create(CreatePurchaseOrderRequest request, String username) {
        if (purchaseOrderRepository.findByOrderNumber(request.getOrderNumber()).isPresent()) {
            throw new BadRequestException("Order number already exists: " + request.getOrderNumber());
        }
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.getSupplierId()));
        if (supplier.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Supplier", request.getSupplierId());
        }
        User user = username != null ? userRepository.findByUsernameAndDeletedAtIsNull(username).orElse(null) : null;

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<PurchaseOrderItem> entityItems = new ArrayList<>();

        for (int i = 0; i < request.getItems().size(); i++) {
            CreatePurchaseOrderItemRequest itemReq = request.getItems().get(i);
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));
            if (product.getDeletedAt() != null) {
                throw new ResourceNotFoundException("Product", itemReq.getProductId());
            }
            UnitOfMeasure uom = itemReq.getUomId() != null
                    ? unitOfMeasureRepository.findById(itemReq.getUomId()).orElse(product.getUom())
                    : product.getUom();
            BigDecimal qty = itemReq.getQuantity();
            BigDecimal unitPrice = itemReq.getUnitPrice();
            BigDecimal lineTotal = qty.multiply(unitPrice);
            totalAmount = totalAmount.add(lineTotal);

            PurchaseOrderItem poi = PurchaseOrderItem.builder()
                    .product(product)
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .uom(uom)
                    .sortOrder(i)
                    .build();
            entityItems.add(poi);
        }

        PurchaseOrder po = PurchaseOrder.builder()
                .orderNumber(request.getOrderNumber())
                .supplier(supplier)
                .user(user)
                .orderDate(request.getOrderDate())
                .totalAmount(totalAmount)
                .status(STATUS_DRAFT)
                .remarks(request.getRemarks())
                .build();
        for (PurchaseOrderItem it : entityItems) {
            it.setPurchaseOrder(po);
            po.getItems().add(it);
        }
        purchaseOrderRepository.saveAndFlush(po);
        return toResponse(po);
    }

    @Transactional(rollbackFor = Exception.class)
    public PurchaseOrderResponse receive(Integer purchaseOrderId, String username) {
        PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(purchaseOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order", purchaseOrderId));
        if (STATUS_RECEIVED.equals(po.getStatus())) {
            throw new BadRequestException("Purchase order already received: " + po.getOrderNumber());
        }

        List<StockMovementItemRequest> stockItems = new ArrayList<>();
        for (PurchaseOrderItem it : po.getItems()) {
            stockItems.add(StockMovementItemRequest.builder()
                    .productId(it.getProduct().getProductId())
                    .quantity(it.getQuantity())
                    .priceAtTransaction(it.getUnitPrice())
                    .build());
        }

        StockInRequest stockInRequest = new StockInRequest();
        stockInRequest.setTransactionDate(po.getOrderDate());
        stockInRequest.setDescription("Purchase, Order # " + po.getOrderNumber());
        stockInRequest.setItems(stockItems);

        TransactionType stockInType = transactionTypeRepository.findByTypeCode("STOCK_IN")
                .orElseThrow(() -> new BadRequestException("Transaction type STOCK_IN not found."));
        StockMovementResponse stockResponse = stockTransactionService.performStockMovement(
                null,
                po.getOrderDate(),
                stockInRequest.getDescription(),
                stockItems,
                stockInType,
                username,
                true,
                null,
                po
        );

        Account inventoryAccount = accountRepository.findFirstByAccountTypeAndIsActiveTrue(ACCOUNT_TYPE_INVENTORY)
                .orElseThrow(() -> new BadRequestException("Inventory account not found. Add an account with type 'Inventory' (e.g. INV001)."));
        Account supplierAccount = po.getSupplier().getAccount();

        String voucherNo = "PO-" + po.getOrderNumber();
        ledgerService.post(
                voucherNo,
                po.getOrderDate(),
                "Purchase, Order # " + po.getOrderNumber(),
                inventoryAccount.getAccountId(),
                supplierAccount.getAccountId(),
                po.getTotalAmount(),
                REF_TYPE_PURCHASE,
                po.getPurchaseOrderId().longValue(),
                ledgerService.getUserIdByUsername(username)
        );

        po.setStatus(STATUS_RECEIVED);
        purchaseOrderRepository.save(po);

        return toResponse(purchaseOrderRepository.findByIdWithItems(purchaseOrderId).orElse(po));
    }

    @Transactional(readOnly = true)
    public PurchaseOrderResponse getById(Integer id) {
        PurchaseOrder po = purchaseOrderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order", id));
        return toResponse(po);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> findAll(java.time.LocalDate fromDate, java.time.LocalDate toDate, Integer supplierId, Pageable pageable) {
        Page<PurchaseOrder> page;
        if (supplierId != null) {
            page = purchaseOrderRepository.findBySupplierSupplierId(supplierId, pageable);
        } else if (fromDate != null && toDate != null) {
            page = purchaseOrderRepository.findByOrderDateBetween(fromDate, toDate, pageable);
        } else {
            page = purchaseOrderRepository.findAll(pageable);
        }
        return page.map(this::toResponse);
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder po) {
        List<PurchaseOrderItemDto> itemDtos = new ArrayList<>();
        for (PurchaseOrderItem it : po.getItems()) {
            Product p = it.getProduct();
            itemDtos.add(PurchaseOrderItemDto.builder()
                    .purchaseOrderItemId(it.getPurchaseOrderItemId())
                    .productId(p.getProductId())
                    .productCode(p.getCode())
                    .productName(p.getNameEn())
                    .quantity(it.getQuantity())
                    .unitPrice(it.getUnitPrice())
                    .lineTotal(it.getLineTotal())
                    .uomName(it.getUom() != null ? it.getUom().getName() : null)
                    .build());
        }
        return PurchaseOrderResponse.builder()
                .purchaseOrderId(po.getPurchaseOrderId())
                .orderNumber(po.getOrderNumber())
                .supplierId(po.getSupplier().getSupplierId())
                .supplierName(po.getSupplier().getName())
                .userId(po.getUser() != null ? po.getUser().getUserId() : null)
                .userName(po.getUser() != null ? (po.getUser().getFullName() != null ? po.getUser().getFullName() : po.getUser().getUsername()) : null)
                .orderDate(po.getOrderDate())
                .totalAmount(po.getTotalAmount())
                .status(po.getStatus())
                .remarks(po.getRemarks())
                .createdAt(po.getCreatedAt())
                .items(itemDtos)
                .build();
    }
}
