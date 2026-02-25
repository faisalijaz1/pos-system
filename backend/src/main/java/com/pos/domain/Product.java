package com.pos.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name_en", nullable = false, length = 300)
    private String nameEn;

    @Column(name = "name_ur", length = 300)
    private String nameUr;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uom_id", nullable = false)
    private UnitOfMeasure uom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(name = "current_stock", nullable = false, precision = 18, scale = 4)
    private BigDecimal currentStock = BigDecimal.ZERO;

    @Column(name = "cost_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Column(name = "selling_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
