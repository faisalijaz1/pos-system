package com.pos.repository;

import com.pos.domain.SalesInvoiceItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesInvoiceItemRepository extends JpaRepository<SalesInvoiceItem, Integer> {

    @Query("SELECT i FROM SalesInvoiceItem i " +
           "JOIN FETCH i.salesInvoice inv " +
           "LEFT JOIN FETCH i.uom " +
           "WHERE i.product.productId = :productId " +
           "AND (:customerId IS NULL OR (inv.customer IS NOT NULL AND inv.customer.customerId = :customerId)) " +
           "ORDER BY inv.invoiceDate DESC, inv.invoiceTime DESC NULLS LAST, i.salesInvoiceItemId DESC")
    List<SalesInvoiceItem> findLastSaleByProductAndOptionalCustomer(
            @Param("productId") Integer productId,
            @Param("customerId") Integer customerId,
            Pageable pageable
    );

    /** Price history: past unit prices for this product from sales (for By Invoice No price comparison). */
    @Query("SELECT i FROM SalesInvoiceItem i " +
           "JOIN FETCH i.salesInvoice inv " +
           "LEFT JOIN FETCH i.uom " +
           "WHERE i.product.productId = :productId " +
           "ORDER BY inv.invoiceDate DESC, inv.invoiceTime DESC NULLS LAST, i.salesInvoiceItemId DESC")
    List<SalesInvoiceItem> findPriceHistoryByProduct(@Param("productId") Integer productId, Pageable pageable);
}
