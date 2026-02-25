package com.pos.service;

import com.pos.domain.Account;
import com.pos.dto.AccountSummaryDto;
import com.pos.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;

    @Transactional(readOnly = true)
    public List<AccountSummaryDto> findAllActive() {
        return accountRepository.findByIsActiveTrueOrderByAccountCodeAsc().stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<AccountSummaryDto> findById(Integer id) {
        return accountRepository.findById(id).map(this::toSummary);
    }

    @Transactional(readOnly = true)
    public List<AccountSummaryDto> search(String term) {
        if (term == null || term.trim().length() < 2) {
            return findAllActive();
        }
        return accountRepository.searchActiveByCodeOrName(term.trim()).stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    private AccountSummaryDto toSummary(Account a) {
        return AccountSummaryDto.builder()
                .accountId(a.getAccountId())
                .accountCode(a.getAccountCode())
                .accountName(a.getAccountName())
                .accountType(a.getAccountType())
                .currentBalance(a.getCurrentBalance())
                .balanceType(a.getBalanceType())
                .build();
    }
}
