package com.pos.service;

import com.pos.domain.Account;
import com.pos.domain.LedgerEntry;
import com.pos.domain.User;
import com.pos.dto.AccountSummaryDto;
import com.pos.dto.LedgerEntryRowDto;
import com.pos.dto.LedgerReportDto;
import com.pos.dto.LedgerEntryDto;
import com.pos.dto.TrialBalanceDto;
import com.pos.exception.BadRequestException;
import com.pos.exception.ResourceNotFoundException;
import com.pos.repository.AccountRepository;
import com.pos.repository.LedgerEntryRepository;
import com.pos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LedgerService {

    private final LedgerEntryRepository ledgerEntryRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Integer getUserIdByUsername(String username) {
        return userRepository.findByUsernameAndDeletedAtIsNull(username)
                .map(User::getUserId)
                .orElse(null);
    }

    /**
     * Centralized double-entry posting. Creates Dr and Cr ledger entries and updates both account balances.
     */
    @Transactional(rollbackFor = Exception.class)
    public void post(
            String voucherNo,
            LocalDate date,
            String description,
            Integer debitAccountId,
            Integer creditAccountId,
            BigDecimal amount,
            String refType,
            Long refId,
            Integer userId
    ) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be positive");
        }
        if (debitAccountId == null || creditAccountId == null) {
            throw new BadRequestException("Debit and credit accounts are required");
        }
        if (debitAccountId.equals(creditAccountId)) {
            throw new BadRequestException("Debit and credit accounts must be different");
        }

        Account debitAccount = accountRepository.findById(debitAccountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", debitAccountId));
        Account creditAccount = accountRepository.findById(creditAccountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", creditAccountId));
        if (!debitAccount.getIsActive() || !creditAccount.getIsActive()) {
            throw new BadRequestException("Account is inactive");
        }

        User createdBy = userId != null ? userRepository.findById(userId).orElse(null) : null;

        LedgerEntry drEntry = LedgerEntry.builder()
                .voucherNo(voucherNo)
                .account(debitAccount)
                .transactionDate(date)
                .description(description)
                .debitAmount(amount)
                .creditAmount(BigDecimal.ZERO)
                .refType(refType)
                .refId(refId)
                .createdBy(createdBy)
                .build();
        ledgerEntryRepository.save(drEntry);

        LedgerEntry crEntry = LedgerEntry.builder()
                .voucherNo(voucherNo)
                .account(creditAccount)
                .transactionDate(date)
                .description(description)
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(amount)
                .refType(refType)
                .refId(refId)
                .createdBy(createdBy)
                .build();
        ledgerEntryRepository.save(crEntry);

        debitAccount.setCurrentBalance(debitAccount.getCurrentBalance().add(amount));
        debitAccount.setBalanceType("Dr");
        accountRepository.save(debitAccount);

        creditAccount.setCurrentBalance(creditAccount.getCurrentBalance().add(amount));
        creditAccount.setBalanceType("Cr");
        accountRepository.save(creditAccount);
    }

    @Transactional(readOnly = true)
    public Page<LedgerEntryDto> getEntries(LocalDate fromDate, LocalDate toDate, Integer accountId, Pageable pageable) {
        LocalDate from = fromDate != null ? fromDate : LocalDate.of(1900, 1, 1);
        LocalDate to = toDate != null ? toDate : LocalDate.of(9999, 12, 31);
        Page<LedgerEntry> page = accountId != null
                ? ledgerEntryRepository.findByDateRangeAndAccount(from, to, accountId, pageable)
                : ledgerEntryRepository.findByDateRange(from, to, pageable);
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public TrialBalanceDto getTrialBalance(LocalDate asOfDate) {
        List<Object[]> rows = ledgerEntryRepository.trialBalanceAsOf(asOfDate);
        List<TrialBalanceDto.TrialBalanceRowDto> list = new ArrayList<>();
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;
        for (Object[] row : rows) {
            Integer accountId = row[0] instanceof Number ? ((Number) row[0]).intValue() : (Integer) row[0];
            String accountCode = (String) row[1];
            String accountName = (String) row[2];
            BigDecimal debit = toBigDecimal(row[3]);
            BigDecimal credit = toBigDecimal(row[4]);
            totalDebit = totalDebit.add(debit);
            totalCredit = totalCredit.add(credit);
            list.add(TrialBalanceDto.TrialBalanceRowDto.builder()
                    .accountId(accountId)
                    .accountCode(accountCode)
                    .accountName(accountName)
                    .debit(debit)
                    .credit(credit)
                    .build());
        }
        return TrialBalanceDto.builder()
                .asOfDate(asOfDate)
                .rows(list)
                .totalDebit(totalDebit)
                .totalCredit(totalCredit)
                .build();
    }

    @Transactional(readOnly = true)
    public LedgerReportDto getLedgerReport(Integer accountId, LocalDate fromDate, LocalDate toDate, int page, int size) {
        if (accountId == null) {
            throw new BadRequestException("Account is required for ledger report");
        }
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", accountId));
        if (fromDate == null) fromDate = LocalDate.now();
        if (toDate == null) toDate = LocalDate.now();
        if (size <= 0) size = 20;
        if (page < 0) page = 0;

        BigDecimal opening = toBigDecimal(ledgerEntryRepository.openingBalanceBefore(accountId, fromDate));
        String openingType = opening.compareTo(BigDecimal.ZERO) >= 0 ? "Dr" : "Cr";
        if (opening.compareTo(BigDecimal.ZERO) < 0) opening = opening.negate();

        Object[] totals = ledgerEntryRepository.periodTotals(accountId, fromDate, toDate);
        BigDecimal totalDr = toBigDecimal(totals != null && totals.length > 0 ? totals[0] : null);
        BigDecimal totalCr = toBigDecimal(totals != null && totals.length > 1 ? totals[1] : null);

        List<LedgerEntry> allEntries = ledgerEntryRepository.findAllByAccountAndDateRangeOrderByDate(accountId, fromDate, toDate);
        BigDecimal runBal = openingType.equals("Cr") ? opening.negate() : opening;
        List<LedgerEntryRowDto> rows = new ArrayList<>();
        for (LedgerEntry e : allEntries) {
            runBal = runBal.add(e.getDebitAmount() != null ? e.getDebitAmount() : BigDecimal.ZERO)
                    .subtract(e.getCreditAmount() != null ? e.getCreditAmount() : BigDecimal.ZERO);
            BigDecimal runAbs = runBal.compareTo(BigDecimal.ZERO) >= 0 ? runBal : runBal.negate();
            String runType = runBal.compareTo(BigDecimal.ZERO) >= 0 ? "Dr" : "Cr";
            rows.add(LedgerEntryRowDto.builder()
                    .ledgerEntryId(e.getLedgerEntryId())
                    .voucherNo(e.getVoucherNo())
                    .transactionDate(e.getTransactionDate())
                    .description(e.getDescription())
                    .debitAmount(e.getDebitAmount())
                    .creditAmount(e.getCreditAmount())
                    .runningBalance(runAbs)
                    .balanceType(runType)
                    .build());
        }
        BigDecimal closingAbs = runBal.compareTo(BigDecimal.ZERO) >= 0 ? runBal : runBal.negate();
        String closingType = runBal.compareTo(BigDecimal.ZERO) >= 0 ? "Dr" : "Cr";

        int totalElements = rows.size();
        int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / size);
        int fromIndex = Math.min(page * size, totalElements);
        int toIndex = Math.min(fromIndex + size, totalElements);
        List<LedgerEntryRowDto> pageEntries = fromIndex < toIndex ? rows.subList(fromIndex, toIndex) : new ArrayList<>();

        AccountSummaryDto accountDto = AccountSummaryDto.builder()
                .accountId(account.getAccountId())
                .accountCode(account.getAccountCode())
                .accountName(account.getAccountName())
                .accountType(account.getAccountType())
                .currentBalance(account.getCurrentBalance())
                .balanceType(account.getBalanceType())
                .build();

        return LedgerReportDto.builder()
                .account(accountDto)
                .fromDate(fromDate)
                .toDate(toDate)
                .openingBalance(opening)
                .openingBalanceType(openingType)
                .entries(pageEntries)
                .totalDr(totalDr)
                .totalCr(totalCr)
                .closingBalance(closingAbs)
                .closingBalanceType(closingType)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .number(page)
                .build();
    }

    private LedgerEntryDto toDto(LedgerEntry e) {
        return LedgerEntryDto.builder()
                .ledgerEntryId(e.getLedgerEntryId())
                .voucherNo(e.getVoucherNo())
                .accountId(e.getAccount().getAccountId())
                .accountCode(e.getAccount().getAccountCode())
                .accountName(e.getAccount().getAccountName())
                .transactionDate(e.getTransactionDate())
                .description(e.getDescription())
                .debitAmount(e.getDebitAmount())
                .creditAmount(e.getCreditAmount())
                .refType(e.getRefType())
                .refId(e.getRefId())
                .createdBy(e.getCreatedBy() != null ? e.getCreatedBy().getUserId() : null)
                .createdAt(e.getCreatedAt())
                .build();
    }

    /** Safely convert repository result to BigDecimal (handles Number, BigDecimal, null, or nested Object[] from some drivers). */
    private static BigDecimal toBigDecimal(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof BigDecimal) return (BigDecimal) o;
        if (o instanceof Number) return BigDecimal.valueOf(((Number) o).doubleValue());
        if (o instanceof Object[]) {
            Object[] arr = (Object[]) o;
            return toBigDecimal(arr.length > 0 ? arr[0] : null);
        }
        return BigDecimal.ZERO;
    }
}
