package com.pos.controller;

import com.pos.dto.StockInRequest;
import com.pos.dto.StockMovementResponse;
import com.pos.dto.StockOutRequest;
import com.pos.service.StockTransactionService;
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
@RequestMapping("/api/v1/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockTransactionService stockTransactionService;

    @PostMapping("/in")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<StockMovementResponse> stockIn(
            @Valid @RequestBody StockInRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        String username = currentUser != null ? currentUser.getUsername() : null;
        StockMovementResponse response = stockTransactionService.stockIn(request, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/out")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<StockMovementResponse> stockOut(
            @Valid @RequestBody StockOutRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        String username = currentUser != null ? currentUser.getUsername() : null;
        StockMovementResponse response = stockTransactionService.stockOut(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/movements")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<Page<StockMovementResponse>> movements(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Integer productId,
            Pageable pageable
    ) {
        Page<StockMovementResponse> page = stockTransactionService.getMovements(fromDate, toDate, productId, pageable);
        return ResponseEntity.ok(page);
    }
}
