package com.pos.repository;

import com.pos.domain.StockTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Integer> {

    boolean existsByRecordNo(String recordNo);

    @Query(value = "SELECT DISTINCT st FROM StockTransaction st " +
           "LEFT JOIN st.items it " +
           "WHERE (:fromDate IS NULL OR st.transactionDate >= :fromDate) " +
           "AND (:toDate IS NULL OR st.transactionDate <= :toDate) " +
           "AND (:productId IS NULL OR it.product.productId = :productId)")
    Page<StockTransaction> findByDateRangeAndProduct(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("productId") Integer productId,
            Pageable pageable
    );
}
