package com.pos.repository;

import com.pos.domain.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {

    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);

    @Query("SELECT po FROM PurchaseOrder po LEFT JOIN FETCH po.items it LEFT JOIN FETCH it.product LEFT JOIN FETCH it.uom WHERE po.purchaseOrderId = :id")
    Optional<PurchaseOrder> findByIdWithItems(@Param("id") Integer id);

    Page<PurchaseOrder> findByOrderDateBetween(LocalDate from, LocalDate to, Pageable pageable);

    Page<PurchaseOrder> findBySupplierSupplierId(Integer supplierId, Pageable pageable);
}
