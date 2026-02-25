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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
    private final SalesInvoiceItemRepository salesInvoiceItemRepository;
    private final LedgerService ledgerService;

    private static final String TRANSACTION_TYPE_SALE = "SALE";
    private static final String TRANSACTION_TYPE_STOCK_OUT = "STOCK_OUT";
    private static final String ACCOUNT_TYPE_REVENUE = "Revenue";
    private static final String REF_TYPE_SALE = "SALE";

    @Transactional(rollbackFor = Exception.class)
    public InvoiceResponse createInvoice(CreateInvoiceRequest request, String username) {
        User user = userRepository.findByUsernameAndDeletedAtIsNull(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", username));

        String txnCode = request.getTransactionTypeCode() != null ? request.getTransactionTypeCode().trim().toUpperCase() : TRANSACTION_TYPE_SALE;
        TransactionType invoiceTxnType = transactionTypeRepository.findByTypeCode(txnCode)
                .orElseThrow(() -> new BadRequestException("Transaction type not found: " + txnCode + ". Use SALE, RETURN, or EXCHANGE."));

        boolean isReturn = "RETURN".equals(txnCode) || "EXCHANGE".equals(txnCode);
        TransactionType stockType = isReturn
                ? transactionTypeRepository.findByTypeCode("STOCK_IN").orElseThrow(() -> new BadRequestException("Transaction type STOCK_IN not found."))
                : transactionTypeRepository.findByTypeCode(TRANSACTION_TYPE_STOCK_OUT).orElseThrow(() -> new BadRequestException("Transaction type STOCK_OUT not found."));

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

        boolean saveAsDraft = Boolean.TRUE.equals(request.getSaveAsDraft());
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
            if (!saveAsDraft && !isReturn && product.getCurrentStock().compareTo(qty) < 0) {
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

            BigDecimal quantityChange = isReturn ? qty : qty.negate();
            StockTransactionItem stItem = StockTransactionItem.builder()
                    .product(product)
                    .quantityChange(quantityChange)
                    .priceAtTransaction(unitPrice)
                    .build();
            stockItems.add(stItem);

            if (!saveAsDraft) {
                if (isReturn) {
                    product.setCurrentStock(product.getCurrentStock().add(qty));
                } else {
                    product.setCurrentStock(product.getCurrentStock().subtract(qty));
                }
                productRepository.save(product);
            }
        }

        BigDecimal additionalDiscount = request.getAdditionalDiscount() != null ? request.getAdditionalDiscount() : BigDecimal.ZERO;
        BigDecimal additionalExpenses = request.getAdditionalExpenses() != null ? request.getAdditionalExpenses() : BigDecimal.ZERO;
        BigDecimal netTotal = grandTotal.subtract(additionalDiscount).add(additionalExpenses);
        BigDecimal amountReceived = request.getAmountReceived() != null ? request.getAmountReceived() : BigDecimal.ZERO;
        BigDecimal changeReturned = request.getChangeReturned() != null ? request.getChangeReturned() : BigDecimal.ZERO;
        String invoiceStatus = saveAsDraft ? "DRAFT" : "COMPLETED";

        SalesInvoice invoice = SalesInvoice.builder()
                .invoiceNumber(request.getInvoiceNumber())
                .branch(branch)
                .customer(customer)
                .user(user)
                .invoiceDate(request.getInvoiceDate())
                .invoiceTime(request.getInvoiceTime())
                .transactionType(invoiceTxnType)
                .deliveryMode(deliveryMode)
                .isCashCustomer(Boolean.TRUE.equals(request.getIsCashCustomer()))
                .grandTotal(grandTotal)
                .additionalDiscount(additionalDiscount)
                .additionalExpenses(additionalExpenses)
                .netTotal(netTotal)
                .amountReceived(amountReceived)
                .changeReturned(changeReturned)
                .invoiceStatus(invoiceStatus)
                .printWithoutHeader(Boolean.TRUE.equals(request.getPrintWithoutHeader()))
                .printWithoutBalance(Boolean.TRUE.equals(request.getPrintWithoutBalance()))
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

        if (!saveAsDraft) {
            String recordNo = "ST-" + (isReturn ? "IN" : "OUT") + "-" + request.getInvoiceNumber() + "-" + UUID.randomUUID().toString().substring(0, 8);
            while (stockTransactionRepository.existsByRecordNo(recordNo)) {
                recordNo = "ST-" + (isReturn ? "IN" : "OUT") + "-" + request.getInvoiceNumber() + "-" + UUID.randomUUID().toString().substring(0, 8);
            }

            StockTransaction stockTxn = StockTransaction.builder()
                    .recordNo(recordNo)
                    .branch(branch)
                    .transactionDate(request.getInvoiceDate())
                    .transactionType(stockType)
                    .description((isReturn ? "Return" : "Sale") + ", Invoice # " + request.getInvoiceNumber())
                    .user(user)
                    .refSalesInvoice(invoice)
                    .build();
            for (StockTransactionItem sti : stockItems) {
                sti.setStockTransaction(stockTxn);
                stockTxn.getItems().add(sti);
            }
            stockTransactionRepository.save(stockTxn);
        }

        if (!saveAsDraft && customer != null && netTotal.compareTo(BigDecimal.ZERO) > 0) {
            Account revenueAccount = accountRepository.findFirstByAccountTypeAndIsActiveTrue(ACCOUNT_TYPE_REVENUE)
                    .orElseThrow(() -> new BadRequestException("Sales Revenue account not found. Add an account with type 'Revenue' (e.g. code REV001)."));
            String voucherNo = "VOU-" + request.getInvoiceNumber().replaceFirst("^INV-", "");
            ledgerService.post(
                    voucherNo,
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

    /** Returns next sequential invoice number for the given date: INV-YYYYMMDD-NNNN. */
    @Transactional(readOnly = true)
    public String getNextInvoiceNumber(LocalDate date) {
        LocalDate d = date != null ? date : LocalDate.now();
        String dateStr = d.format(DateTimeFormatter.BASIC_ISO_DATE);
        String prefix = "INV-" + dateStr + "-";
        int nextSeq = 1;
        Optional<SalesInvoice> last = salesInvoiceRepository.findTop1ByInvoiceNumberStartingWithOrderByInvoiceNumberDesc(prefix);
        if (last.isPresent()) {
            String num = last.get().getInvoiceNumber();
            if (num != null && num.length() >= 4) {
                try {
                    nextSeq = Integer.parseInt(num.substring(num.length() - 4), 10) + 1;
                } catch (NumberFormatException ignored) { }
            }
        }
        return prefix + String.format("%04d", Math.min(9999, Math.max(1, nextSeq)));
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getByInvoiceNumber(String invoiceNumber) {
        String input = invoiceNumber != null ? invoiceNumber.trim() : "";
        if (input.length() == 4 && input.matches("\\d{4}")) {
            Page<SalesInvoice> page = salesInvoiceRepository.findByInvoiceNumberEndingWith(input, PageRequest.of(0, 1));
            SalesInvoice invoice = page.getContent().isEmpty() ? null : page.getContent().get(0);
            if (invoice == null) {
                throw new ResourceNotFoundException("Invoice", "suffix " + input);
            }
            return toResponse(salesInvoiceRepository.findByIdWithItems(invoice.getSalesInvoiceId()).orElse(invoice));
        }
        SalesInvoice invoice = salesInvoiceRepository.findByInvoiceNumberWithItems(input)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", input));
        return toResponse(invoice);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceSummaryDto> findAll(LocalDate fromDate, LocalDate toDate, Integer customerId, Pageable pageable) {
        Page<SalesInvoice> page = salesInvoiceRepository.findByDateRangeAndCustomer(fromDate, toDate, customerId, pageable);
        return page.map(this::toSummaryDto);
    }

    /** Update invoice header, billing, and print options (Sales History edit). */
    @Transactional(rollbackFor = Exception.class)
    public InvoiceResponse updateInvoice(Integer id, UpdateInvoiceRequest request) {
        SalesInvoice inv = salesInvoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
        if (request.getInvoiceDate() != null) inv.setInvoiceDate(request.getInvoiceDate());
        if (request.getInvoiceTime() != null) inv.setInvoiceTime(request.getInvoiceTime());
        if (request.getDeliveryModeId() != null) {
            inv.setDeliveryMode(deliveryModeRepository.findById(request.getDeliveryModeId()).orElse(inv.getDeliveryMode()));
        }
        if (request.getAdditionalDiscount() != null) inv.setAdditionalDiscount(request.getAdditionalDiscount());
        if (request.getAdditionalExpenses() != null) inv.setAdditionalExpenses(request.getAdditionalExpenses());
        if (request.getPrintWithoutHeader() != null) inv.setPrintWithoutHeader(request.getPrintWithoutHeader());
        if (request.getPrintWithoutBalance() != null) inv.setPrintWithoutBalance(request.getPrintWithoutBalance());
        if (request.getRemarks() != null) inv.setRemarks(request.getRemarks());
        if (request.getBillingNo() != null) inv.setBillingNo(request.getBillingNo());
        if (request.getBillingDate() != null) inv.setBillingDate(request.getBillingDate());
        if (request.getBillingPacking() != null) inv.setBillingPacking(request.getBillingPacking());
        if (request.getBillingAdda() != null) inv.setBillingAdda(request.getBillingAdda());
        if (request.getAmountReceived() != null) inv.setAmountReceived(request.getAmountReceived());
        if (request.getChangeReturned() != null) inv.setChangeReturned(request.getChangeReturned());
        recalcNetTotal(inv);
        salesInvoiceRepository.save(inv);
        return getById(id);
    }

    /** Add a line item to an existing invoice. Recalculates totals. */
    @Transactional(rollbackFor = Exception.class)
    public InvoiceResponse addItem(Integer invoiceId, AddInvoiceItemRequest request) {
        SalesInvoice inv = salesInvoiceRepository.findByIdWithItems(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));
        if (product.getDeletedAt() != null) throw new ResourceNotFoundException("Product", request.getProductId());
        BigDecimal qty = request.getQuantity();
        BigDecimal unitPrice = request.getUnitPrice() != null ? request.getUnitPrice() : product.getSellingPrice();
        BigDecimal lineTotal = qty.multiply(unitPrice);
        UnitOfMeasure uom = request.getUomId() != null
                ? unitOfMeasureRepository.findById(request.getUomId()).orElse(product.getUom())
                : product.getUom();
        int sortOrder = inv.getItems().isEmpty() ? 0 : inv.getItems().stream().mapToInt(SalesInvoiceItem::getSortOrder).max().orElse(0) + 1;
        SalesInvoiceItem item = SalesInvoiceItem.builder()
                .salesInvoice(inv)
                .product(product)
                .quantity(qty)
                .unitPrice(unitPrice)
                .lineTotal(lineTotal)
                .uom(uom)
                .sortOrder(sortOrder)
                .build();
        inv.getItems().add(item);
        recalcNetTotal(inv);
        salesInvoiceRepository.saveAndFlush(inv);
        return getById(invoiceId);
    }

    /** Update quantity/price of an existing line item. Recalculates totals. */
    @Transactional(rollbackFor = Exception.class)
    public InvoiceResponse updateItem(Integer invoiceId, Integer itemId, UpdateInvoiceItemRequest request) {
        SalesInvoice inv = salesInvoiceRepository.findByIdWithItems(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));
        SalesInvoiceItem item = inv.getItems().stream()
                .filter(i -> i.getSalesInvoiceItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Invoice item", itemId));
        if (request.getQuantity() != null) item.setQuantity(request.getQuantity());
        if (request.getUnitPrice() != null) item.setUnitPrice(request.getUnitPrice());
        item.setLineTotal(item.getQuantity().multiply(item.getUnitPrice()));
        recalcNetTotal(inv);
        salesInvoiceRepository.save(inv);
        return getById(invoiceId);
    }

    /** Remove a line item. Recalculates totals. */
    @Transactional(rollbackFor = Exception.class)
    public InvoiceResponse deleteItem(Integer invoiceId, Integer itemId) {
        SalesInvoice inv = salesInvoiceRepository.findByIdWithItems(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));
        boolean removed = inv.getItems().removeIf(i -> i.getSalesInvoiceItemId().equals(itemId));
        if (!removed) throw new ResourceNotFoundException("Invoice item", itemId);
        recalcNetTotal(inv);
        salesInvoiceRepository.save(inv);
        return getById(invoiceId);
    }

    private void recalcNetTotal(SalesInvoice inv) {
        BigDecimal grand = inv.getItems().stream()
                .map(SalesInvoiceItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        inv.setGrandTotal(grand);
        BigDecimal net = grand.subtract(inv.getAdditionalDiscount() != null ? inv.getAdditionalDiscount() : BigDecimal.ZERO)
                .add(inv.getAdditionalExpenses() != null ? inv.getAdditionalExpenses() : BigDecimal.ZERO);
        inv.setNetTotal(net);
    }

    /** Navigate to first/prev/next/last invoice by date. Returns summary for the target invoice or null if none. */
    @Transactional(readOnly = true)
    public InvoiceSummaryDto navigate(LocalDate date, Integer currentId, String direction) {
        Pageable one = PageRequest.of(0, 1);
        if (direction == null) direction = "next";
        Page<SalesInvoice> page;
        switch (direction.toLowerCase()) {
            case "first":
                page = salesInvoiceRepository.findFirstByDateOrderByIdAsc(date, one);
                break;
            case "last":
                page = salesInvoiceRepository.findFirstByDateOrderByIdDesc(date, one);
                break;
            case "prev":
                if (currentId == null) return null;
                page = salesInvoiceRepository.findPreviousInvoice(date, currentId, one);
                break;
            case "next":
                if (currentId == null) {
                    page = salesInvoiceRepository.findFirstByDateOrderByIdAsc(date, one);
                } else {
                    page = salesInvoiceRepository.findNextInvoice(date, currentId, one);
                }
                break;
            default:
                page = salesInvoiceRepository.findFirstByDateOrderByIdAsc(date, one);
                break;
        }
        return page.getContent().isEmpty() ? null : toSummaryDto(page.getContent().get(0));
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
                    .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
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
                .changeReturned(inv.getChangeReturned() != null ? inv.getChangeReturned() : BigDecimal.ZERO)
                .invoiceStatus(inv.getInvoiceStatus())
                .printWithoutHeader(inv.getPrintWithoutHeader())
                .printWithoutBalance(inv.getPrintWithoutBalance())
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
