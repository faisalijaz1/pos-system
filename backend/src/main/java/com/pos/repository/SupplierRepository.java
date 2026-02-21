package com.pos.repository;

import com.pos.domain.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

    java.util.Optional<Supplier> findBySupplierIdAndDeletedAtIsNull(Integer supplierId);

    List<Supplier> findByDeletedAtIsNullOrderByNameAsc();
}
