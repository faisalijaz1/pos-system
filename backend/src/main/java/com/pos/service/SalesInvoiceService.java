package com.pos.service;

import com.pos.domain.*;
import com.pos.dto.*;
import com.pos.service.LedgerService;
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
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesInvoiceService {

    private final SalesInvoiceRepository salesInvoiceRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionTypeRepository transactionTypeRepository;
    private final DeliveryModeRepository deliveryModeRepository;
    private final BranchRepository branchRepository;
    private final UnitOfMeasureRepository unitOfMeasureRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final LedgerService ledgerService;

    private static final String TRANSACTION_TYPE_SALE = "SALE";
    private static final String TRANSACTION_TYPE_STOCK_OUT = "STOCK_OUT";
    private static final String ACCOUNT_TYPE_REVENUE = "Revenue";
    private static final String REF_TYPE_SALE = "SALE";

    @Transactional(rollbackFor = Exception.class)
    public InvoiceResponse createInvoice(CreateInvoiceRequest request, String username) {
        User user = userRepository.findByUsernameAndDeletedAtIsNull(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));

        TransactionType saleType = transactionTypeRepository.findByTypeCode(TRANSACTION_TYPE_SALE)
                .orElseThrow(() -> new BadRequestException("Transaction type SALE not found. Run seed data."));

        TransactionType stockOutType = transactionTypeRepository.findByTypeCode(TRANSACTION_TYPE_STOCK_OUT)
                .orElseThrow(() -> new BadRequestException("Transaction type STOCK_OUT not found. Run seed data."));

        if (salesInvoiceRepository.findByInvoiceNumber(request.getInvoiceNumber()).isPresent()) {
            throw new BadRequestException("Invoice number already exists: " + request.getInvoiceNumber());
        }

        Customer customer = null;
        if (request.getCustomerId() != null && !Boolean.TRUE.equals(request.getIsCashCustomer())) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));
            if (customer.getDeletedAt() != null) {
                throw new ResourceNotFoundException("Customer", request.getCustomerId());
            }
        }

        Branch branch = request.getBranchId() != null
                ? branchRepository.findById(request.getBranchId()).orElse(null)
                : null;

        DeliveryMode deliveryMode = request.getDeliveryModeId() != null
                ? deliveryModeRepository.findById(request.getDeliveryModeId()).orElse(null)
                : null;

        BigDecimal grandTotal = BigDecimal.ZERO;
        List<SalesInvoiceItem> invoiceItems = new ArrayList<>();
        List<StockTransactionItem> stockItems = new ArrayList<>();

        for (int i = 0; i < request.getItems().size(); i++) {
            CreateInvoiceItemRequest itemReq = request.getItems().get(i);
            Product product = productRepository.findByIdForUpdate(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", itemReq.getProductId()));
            if (product.getDeletedAt() != null) {
                throw new ResourceNotFoundException("Product", itemReq.getProductId());
            }

            BigDecimal qty = itemReq.getQuantity();
            if (product.getCurrentStock().compareTo(qty) < 0) {
                throw new BadRequestException(
                        "Insufficient stock for product " + product.getCode() + ". Available: " + product.getCurrentStock() + ", requested: " + qty);
            }

            BigDecimal unitPrice = itemReq.getUnitPrice();
            BigDecimal lineTotal = qty.multiply(unitPrice);
            grandTotal = grandTotal.add(lineTotal);

            UnitOfMeasure uom = itemReq.getUomId() != null
                    ? unitOfMeasureRepository.findById(itemReq.getUomId()).orElse(product.getUom())
                    : product.getUom();

            SalesInvoiceItem invItem = SalesInvoiceItem.builder()
                    .product(product)
                    .quantity(qty)
                    .unitPrice(unitPrice)
                    .lineTotal(lineTotal)
                    .uom(uom)
                    .sortOrder(i)
                    .build();
            invoiceItems.add(invItem);

            StockTransactionItem stItem = StockTransactionItem.builder()
                    .product(product)
                    .quantityChange(qty.negate())
                    .priceAtTransaction(unitPrice)
                    .build();
            stockItems.add(stItem);

            product.setCurrentStock(product.getCurrentStock().subtract(qty));
            productRepository.save(product);
        }

        BigDecimal additionalDiscount = request.getAdditionalDiscount() != null ? request.getAdditionalDiscount() : BigDecimal.ZERO;
        BigDecimal additionalExpenses = request.getAdditionalExpenses() != null ? request.getAdditionalExpenses() : BigDecimal.ZERO;
        BigDecimal netTotal = grandTotal.subtract(additionalDiscount).add(additionalExpenses);
        BigDecimal amountReceived = request.getAmountReceived() != null ? request.getAmountReceived() : BigDecimal.ZERO;

        SalesInvoice invoice = SalesInvoice.builder()
                .invoiceNumber(request.getInvoiceNumber())
                .branch(branch)
                .customer(customer)
                .user(user)
                .invoiceDate(request.getInvoiceDate())
                .invoiceTime(request.getInvoiceTime())
                .transactionType(saleType)
                .deliveryMode(deliveryMode)
                .isCashCustomer(Boolean.TRUE.equals(request.getIsCashCustomer()))
                .grandTotal(grandTotal)
                .additionalDiscount(additionalDiscount)
                .additionalExpenses(additionalExpenses)
                .netTotal(netTotal)
                .amountReceived(amountReceived)
                .remarks(request.getRemarks())
                .billingNo(request.getBillingNo())
                .billingDate(request.getBillingDate())
                .billingPacking(request.getBillingPacking())
                .billingAdda(request.getBillingAdda())
                .build();

        for (SalesInvoiceItem it : invoiceItems) {
            it.setSalesInvoice(invoice);
            invoice.getItems().add(it);
        }
        salesInvoiceRepository.saveAndFlush(invoice);

        String recordNo = "ST-OUT-" + request.getInvoiceNumber() + "-" + UUID.randomUUID().toString().substring(0, 8);
        while (stockTransactionRepository.existsByRecordNo(recordNo)) {
            recordNo = "ST-OUT-" + request.getInvoiceNumber() + "-" + UUID.randomUUID().toString().substring(0, 8);
        }

        StockTransaction stockTxn = StockTransaction.builder()
                .recordNo(recordNo)
                .branch(branch)
                .transactionDate(request.getInvoiceDate())
                .transactionType(stockOutType)
                .description("Sale, Invoice # " + request.getInvoiceNumber())
                .user(user)
                .refSalesInvoice(invoice)
                .build();
        for (StockTransactionItem sti : stockItems) {
            sti.setStockTransaction(stockTxn);
            stockTxn.getItems().add(sti);
        }
        stockTransactionRepository.save(stockTxn);

        if (customer != null && netTotal.compareTo(BigDecimal.ZERO) > 0) {
            Account revenueAccount = accountRepository.findFirstByAccountTypeAndIsActiveTrue(ACCOUNT_TYPE_REVENUE)
                    .orElseThrow(() -> new BadRequestException("Sales Revenue account not found. Add an account with type 'Revenue' (e.g. code REV001)."));
            ledgerService.post(
                    "INV-" + request.getInvoiceNumber(),
                    request.getInvoiceDate(),
                    "Sale, Invoice # " + request.getInvoiceNumber(),
                    customer.getAccount().getAccountId(),
                    revenueAccount.getAccountId(),
                    netTotal,
                    REF_TYPE_SALE,
                    invoice.getSalesInvoiceId().longValue(),
                    user.getUserId()
            );
        }

        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getById(Integer id) {
        SalesInvoice invoice = salesInvoiceRepository.findByIdWithItems(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getByInvoiceNumber(String invoiceNumber) {
        SalesInvoice invoice = salesInvoiceRepository.findByInvoiceNumberWithItems(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceNumber));
        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceSummaryDto> findAll(LocalDate fromDate, LocalDate toDate, Integer customerId, Pageable pageable) {
        Page<SalesInvoice> page = salesInvoiceRepository.findByDateRangeAndCustomer(fromDate, toDate, customerId, pageable);
        return page.map(this::toSummaryDto);
    }

    private InvoiceResponse toResponse(SalesInvoice inv) {
        List<InvoiceItemResponse> itemDtos = new ArrayList<>();
        for (SalesInvoiceItem it : inv.getItems()) {
            Product p = it.getProduct();
            itemDtos.add(InvoiceItemResponse.builder()
                    .salesInvoiceItemId(it.getSalesInvoiceItemId())
                    .productId(p.getProductId())
                    .productCode(p.getCode())
                    .productName(p.getNameEn())
                    .quantity(it.getQuantity())
                    .unitPrice(it.getUnitPrice())
                    .lineTotal(it.getLineTotal())
                    .uomName(it.getUom() != null ? it.getUom().getName() : null)
                    .sortOrder(it.getSortOrder())
                    .build());
        }
        return InvoiceResponse.builder()
                .salesInvoiceId(inv.getSalesInvoiceId())
                .invoiceNumber(inv.getInvoiceNumber())
                .branchId(inv.getBranch() != null ? inv.getBranch().getBranchId() : null)
                .customerId(inv.getCustomer() != null ? inv.getCustomer().getCustomerId() : null)
                .customerName(inv.getCustomer() != null ? inv.getCustomer().getName() : null)
                .userId(inv.getUser().getUserId())
                .userName(inv.getUser().getFullName() != null ? inv.getUser().getFullName() : inv.getUser().getUsername())
                .invoiceDate(inv.getInvoiceDate())
                .invoiceTime(inv.getInvoiceTime())
                .transactionTypeCode(inv.getTransactionType().getTypeCode())
                .deliveryModeId(inv.getDeliveryMode() != null ? inv.getDeliveryMode().getDeliveryModeId() : null)
                .isCashCustomer(inv.getIsCashCustomer())
                .grandTotal(inv.getGrandTotal())
                .additionalDiscount(inv.getAdditionalDiscount())
                .additionalExpenses(inv.getAdditionalExpenses())
                .netTotal(inv.getNetTotal())
                .amountReceived(inv.getAmountReceived())
                .remarks(inv.getRemarks())
                .billingNo(inv.getBillingNo())
                .billingDate(inv.getBillingDate())
                .billingPacking(inv.getBillingPacking())
                .billingAdda(inv.getBillingAdda())
                .createdAt(inv.getCreatedAt())
                .items(itemDtos)
                .build();
    }

    private InvoiceSummaryDto toSummaryDto(SalesInvoice inv) {
        return InvoiceSummaryDto.builder()
                .salesInvoiceId(inv.getSalesInvoiceId())
                .invoiceNumber(inv.getInvoiceNumber())
                .customerId(inv.getCustomer() != null ? inv.getCustomer().getCustomerId() : null)
                .customerName(inv.getCustomer() != null ? inv.getCustomer().getName() : null)
                .invoiceDate(inv.getInvoiceDate())
                .netTotal(inv.getNetTotal())
                .amountReceived(inv.getAmountReceived())
                .build();
    }
}
