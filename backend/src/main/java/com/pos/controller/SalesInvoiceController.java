package com.pos.controller;

import com.pos.dto.*;
import com.pos.service.SalesInvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/v1/invoices")
@RequiredArgsConstructor
public class SalesInvoiceController {

    private final SalesInvoiceService salesInvoiceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<InvoiceResponse> create(
            @Valid @RequestBody CreateInvoiceRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        String username = currentUser != null ? currentUser.getUsername() : null;
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        InvoiceResponse created = salesInvoiceService.createInvoice(request, username);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/navigate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<InvoiceSummaryDto> navigate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Integer currentId,
            @RequestParam(defaultValue = "next") String direction
    ) {
        InvoiceSummaryDto result = salesInvoiceService.navigate(date, currentId, direction);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<InvoiceResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(salesInvoiceService.getById(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<InvoiceResponse> update(
            @PathVariable Integer id,
            @RequestBody UpdateInvoiceRequest request
    ) {
        return ResponseEntity.ok(salesInvoiceService.updateInvoice(id, request));
    }

    @PostMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<InvoiceResponse> addItem(
            @PathVariable Integer id,
            @Valid @RequestBody AddInvoiceItemRequest request
    ) {
        return ResponseEntity.ok(salesInvoiceService.addItem(id, request));
    }

    @PutMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<InvoiceResponse> updateItem(
            @PathVariable Integer id,
            @PathVariable Integer itemId,
            @RequestBody UpdateInvoiceItemRequest request
    ) {
        return ResponseEntity.ok(salesInvoiceService.updateItem(id, itemId, request));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<InvoiceResponse> deleteItem(
            @PathVariable Integer id,
            @PathVariable Integer itemId
    ) {
        return ResponseEntity.ok(salesInvoiceService.deleteItem(id, itemId));
    }

    @GetMapping("/next-number")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<String> getNextInvoiceNumber(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(salesInvoiceService.getNextInvoiceNumber(date));
    }

    @GetMapping("/number/{invoiceNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<InvoiceResponse> getByInvoiceNumber(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(salesInvoiceService.getByInvoiceNumber(invoiceNumber));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<Page<InvoiceSummaryDto>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Integer customerId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<InvoiceSummaryDto> page = salesInvoiceService.findAll(fromDate, toDate, customerId, pageable);
        return ResponseEntity.ok(page);
    }
}
