package com.pos.controller;

import com.pos.dto.LedgerEntryDto;
import com.pos.dto.LedgerReportDto;
import com.pos.dto.ManualLedgerEntryRequest;
import com.pos.dto.TrialBalanceDto;
import com.pos.service.LedgerService;
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
@RequestMapping("/v1/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;

    @PostMapping("/manual-entry")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> manualEntry(
            @Valid @RequestBody ManualLedgerEntryRequest request,
            @AuthenticationPrincipal UserDetails currentUser
    ) {
        Integer userId = null;
        if (currentUser != null) {
            userId = ledgerService.getUserIdByUsername(currentUser.getUsername());
        }
        ledgerService.post(
                request.getVoucherNo(),
                request.getTransactionDate(),
                request.getDescription(),
                request.getDebitAccountId(),
                request.getCreditAccountId(),
                request.getAmount(),
                request.getRefType(),
                request.getRefId(),
                userId
        );
        return ResponseEntity.ok().build();
    }

    @GetMapping("/entries")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<Page<LedgerEntryDto>> entries(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Integer accountId,
            Pageable pageable
    ) {
        Page<LedgerEntryDto> page = ledgerService.getEntries(fromDate, toDate, accountId, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/trial-balance")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TrialBalanceDto> trialBalance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOfDate
    ) {
        LocalDate date = asOfDate != null ? asOfDate : LocalDate.now();
        TrialBalanceDto dto = ledgerService.getTrialBalance(date);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<LedgerReportDto> report(
            @RequestParam Integer accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        LocalDate from = fromDate != null ? fromDate : LocalDate.now();
        LocalDate to = toDate != null ? toDate : LocalDate.now();
        LedgerReportDto dto = ledgerService.getLedgerReport(accountId, from, to, page, size);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/report/print")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')")
    public ResponseEntity<LedgerReportDto> reportPrint(
            @RequestParam Integer accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        LocalDate from = fromDate != null ? fromDate : LocalDate.now();
        LocalDate to = toDate != null ? toDate : LocalDate.now();
        LedgerReportDto dto = ledgerService.getLedgerReport(accountId, from, to, 0, Integer.MAX_VALUE);
        return ResponseEntity.ok(dto);
    }
}