package com.pos.domain;

import lombok.*;
import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductUomPriceId implements Serializable {

    private Integer productId;
    private Integer uomId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProductUomPriceId that = (ProductUomPriceId) o;
        return Objects.equals(productId, that.productId) && Objects.equals(uomId, that.uomId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, uomId);
    }
}
