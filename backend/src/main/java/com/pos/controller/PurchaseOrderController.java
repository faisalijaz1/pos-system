package com.pos.controller;

import com.pos.dto.CreatePurchaseOrderRequest;
import com.pos.dto.PurchaseOrderResponse;
import com.pos.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/purchases")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> create(
            @Valid @RequestBody CreatePurchaseOrderRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        String username = currentUser != null ? currentUser.getUsername() : null;
        PurchaseOrderResponse created = purchaseOrderService.create(request, username);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PurchaseOrderResponse> receive(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        String username = currentUser != null ? currentUser.getUsername() : null;
        PurchaseOrderResponse received = purchaseOrderService.receive(id, username);
        return ResponseEntity.ok(received);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<PurchaseOrderResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(purchaseOrderService.getById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<Page<PurchaseOrderResponse>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Integer supplierId,
            Pageable pageable
    ) {
        Page<PurchaseOrderResponse> page = purchaseOrderService.findAll(fromDate, toDate, supplierId, pageable);
        return ResponseEntity.ok(page);
    }
}
