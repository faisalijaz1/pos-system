package com.pos.service;

import com.pos.domain.Account;
import com.pos.domain.Customer;
import com.pos.dto.CustomerSummaryDto;
import com.pos.exception.ResourceNotFoundException;
import com.pos.repository.AccountRepository;
import com.pos.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;

    @Transactional(readOnly = true)
    public Page<CustomerSummaryDto> findAll(String name, Pageable pageable) {
        Page<Customer> page = name != null && !name.isBlank()
                ? customerRepository.findByDeletedAtIsNullAndNameContainingIgnoreCase(name.trim(), pageable)
                : customerRepository.findByDeletedAtIsNull(pageable);
        return page.map(this::toSummaryDto);
    }

    @Transactional(readOnly = true)
    public CustomerSummaryDto findById(Integer id) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
        if (c.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Customer", id);
        }
        return toSummaryDto(c);
    }

    private CustomerSummaryDto toSummaryDto(Customer c) {
        Account acc = c.getAccount();
        return CustomerSummaryDto.builder()
                .customerId(c.getCustomerId())
                .customerCode(c.getCustomerCode())
                .name(c.getName())
                .nameEnglish(c.getNameEnglish())
                .mobile(c.getMobile())
                .city(c.getCity())
                .creditLimit(c.getCreditLimit())
                .joiningDate(c.getJoiningDate())
                .currentBalance(acc != null ? acc.getCurrentBalance() : null)
                .build();
    }
}
