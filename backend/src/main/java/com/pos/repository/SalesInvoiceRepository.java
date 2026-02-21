package com.pos.repository;

import com.pos.domain.SalesInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Integer> {

    @Query("SELECT i FROM SalesInvoice i LEFT JOIN FETCH i.items it LEFT JOIN FETCH it.product LEFT JOIN FETCH it.uom WHERE i.salesInvoiceId = :id")
    Optional<SalesInvoice> findByIdWithItems(@Param("id") Integer id);

    @Query("SELECT i FROM SalesInvoice i LEFT JOIN FETCH i.items it LEFT JOIN FETCH it.product LEFT JOIN FETCH it.uom WHERE i.invoiceNumber = :invoiceNumber")
    Optional<SalesInvoice> findByInvoiceNumberWithItems(@Param("invoiceNumber") String invoiceNumber);

    Optional<SalesInvoice> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT i FROM SalesInvoice i " +
           "WHERE (:fromDate IS NULL OR i.invoiceDate >= :fromDate) " +
           "AND (:toDate IS NULL OR i.invoiceDate <= :toDate) " +
           "AND (:customerId IS NULL OR (i.customer IS NOT NULL AND i.customer.customerId = :customerId))")
    Page<SalesInvoice> findByDateRangeAndCustomer(
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("customerId") Integer customerId,
            Pageable pageable
    );
}
