package com.pos.service;

import com.pos.domain.Account;
import com.pos.domain.LedgerEntry;
import com.pos.domain.User;
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
        Page<LedgerEntry> page = ledgerEntryRepository.findByDateRangeAndAccount(fromDate, toDate, accountId, pageable);
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
            BigDecimal debit = row[3] != null ? (BigDecimal) row[3] : BigDecimal.ZERO;
            BigDecimal credit = row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO;
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
}
