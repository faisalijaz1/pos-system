package com.pos.repository;

import com.pos.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    @EntityGraph(attributePaths = {"uom", "brand"})
    Optional<Product> findByProductIdAndDeletedAtIsNull(Integer productId);

    @EntityGraph(attributePaths = {"uom", "brand"})
    List<Product> findByProductIdInAndDeletedAtIsNull(List<Integer> productIds);

    @EntityGraph(attributePaths = {"uom", "brand"})
    Page<Product> findByDeletedAtIsNull(Pageable pageable);

    @EntityGraph(attributePaths = {"uom", "brand"})
    Page<Product> findByDeletedAtIsNullAndNameEnContainingIgnoreCase(String nameEn, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.productId = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Integer id);
}
