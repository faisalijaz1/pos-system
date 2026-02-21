package com.pos.repository;

import com.pos.domain.LedgerEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Integer> {

    @Query("SELECT e FROM LedgerEntry e JOIN FETCH e.account " +
           "WHERE (:fromDate IS NULL OR e.transactionDate >= :fromDate) " +
           "AND (:toDate IS NULL OR e.transactionDate <= :toDate) " +
           "AND (:accountId IS NULL OR e.account.accountId = :accountId) " +
           "ORDER BY e.transactionDate, e.ledgerEntryId")
    Page<LedgerEntry> findByDateRangeAndAccount(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("accountId") Integer accountId,
            Pageable pageable
    );

    @Query(value = "SELECT a.account_id, a.account_code, a.account_name, " +
           "COALESCE(SUM(le.debit_amount), 0) AS debit_total, COALESCE(SUM(le.credit_amount), 0) AS credit_total " +
           "FROM accounts a " +
           "LEFT JOIN ledger_entries le ON le.account_id = a.account_id AND le.transaction_date <= :asOfDate " +
           "WHERE a.is_active = true " +
           "GROUP BY a.account_id, a.account_code, a.account_name " +
           "HAVING COALESCE(SUM(le.debit_amount), 0) <> 0 OR COALESCE(SUM(le.credit_amount), 0) <> 0 " +
           "ORDER BY a.account_code", nativeQuery = true)
    List<Object[]> trialBalanceAsOf(@Param("asOfDate") LocalDate asOfDate);
}
