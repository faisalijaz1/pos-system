package com.pos.repository;

import com.pos.domain.ProductUomPrice;
import com.pos.domain.ProductUomPriceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductUomPriceRepository extends JpaRepository<ProductUomPrice, ProductUomPriceId> {

    List<ProductUomPrice> findByProductIdOrderByUomId(Integer productId);
}
