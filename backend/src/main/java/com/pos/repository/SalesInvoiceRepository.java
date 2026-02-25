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

    @Query("SELECT DISTINCT i FROM SalesInvoice i LEFT JOIN FETCH i.items it LEFT JOIN FETCH it.product p LEFT JOIN FETCH p.brand LEFT JOIN FETCH it.uom WHERE i.salesInvoiceId = :id")
    Optional<SalesInvoice> findByIdWithItems(@Param("id") Integer id);

    @Query("SELECT DISTINCT i FROM SalesInvoice i LEFT JOIN FETCH i.items it LEFT JOIN FETCH it.product p LEFT JOIN FETCH p.brand LEFT JOIN FETCH it.uom WHERE i.invoiceNumber = :invoiceNumber")
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

    /** First invoice (min id) on given date. For sequential navigation "First". */
    @Query("SELECT i FROM SalesInvoice i WHERE i.invoiceDate = :date ORDER BY i.salesInvoiceId ASC")
    Page<SalesInvoice> findFirstByDateOrderByIdAsc(@Param("date") LocalDate date, Pageable pageable);

    /** Last invoice (max id) on given date. For sequential navigation "Last". */
    @Query("SELECT i FROM SalesInvoice i WHERE i.invoiceDate = :date ORDER BY i.salesInvoiceId DESC")
    Page<SalesInvoice> findFirstByDateOrderByIdDesc(@Param("date") LocalDate date, Pageable pageable);

    /** Previous invoice: same date with smaller id, or earlier date. For "Previous". */
    @Query("SELECT i FROM SalesInvoice i WHERE (i.invoiceDate < :date) OR (i.invoiceDate = :date AND i.salesInvoiceId < :currentId) ORDER BY i.invoiceDate DESC, i.salesInvoiceId DESC")
    Page<SalesInvoice> findPreviousInvoice(@Param("date") LocalDate date, @Param("currentId") Integer currentId, Pageable pageable);

    /** Next invoice: same date with larger id, or later date. For "Next". */
    @Query("SELECT i FROM SalesInvoice i WHERE (i.invoiceDate > :date) OR (i.invoiceDate = :date AND i.salesInvoiceId > :currentId) ORDER BY i.invoiceDate ASC, i.salesInvoiceId ASC")
    Page<SalesInvoice> findNextInvoice(@Param("date") LocalDate date, @Param("currentId") Integer currentId, Pageable pageable);

    /** For sequential next-number: highest invoice number for the day (prefix INV-YYYYMMDD-). */
    Optional<SalesInvoice> findTop1ByInvoiceNumberStartingWithOrderByInvoiceNumberDesc(String prefix);

    /** Find invoice by last-4-digit suffix (e.g. "0058" matches INV-*-0058). One result, most recent by id. */
    @Query("SELECT i FROM SalesInvoice i WHERE i.invoiceNumber LIKE CONCAT('%', :suffix) ORDER BY i.salesInvoiceId DESC")
    Page<SalesInvoice> findByInvoiceNumberEndingWith(@Param("suffix") String suffix, Pageable pageable);
}
