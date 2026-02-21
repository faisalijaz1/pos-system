package com.pos.repository;

import com.pos.domain.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Page<Customer> findByDeletedAtIsNull(Pageable pageable);

    Page<Customer> findByDeletedAtIsNullAndNameContainingIgnoreCase(String name, Pageable pageable);
}
