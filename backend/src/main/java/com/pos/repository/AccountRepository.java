package com.pos.repository;

import com.pos.domain.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {

    List<Account> findByIsActiveTrueOrderByAccountCodeAsc();

    @Query("SELECT a FROM Account a WHERE a.isActive = true " +
           "AND (LOWER(a.accountCode) LIKE LOWER(CONCAT('%', :term, '%')) OR LOWER(a.accountName) LIKE LOWER(CONCAT('%', :term, '%'))) " +
           "ORDER BY a.accountCode")
    List<Account> searchActiveByCodeOrName(@Param("term") String term);

    Page<Account> findByAccountTypeAndIsActiveTrue(String accountType, Pageable pageable);

    Optional<Account> findFirstByAccountTypeAndIsActiveTrue(String accountType);
}
