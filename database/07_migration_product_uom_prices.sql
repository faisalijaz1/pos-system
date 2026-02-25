-- =============================================================================
-- Migration: Product prices per unit of measure (UOM)
-- Run on Railway PostgreSQL and/or local. Idempotent (safe to run multiple times).
-- =============================================================================

-- Table: product_uom_prices — one price per product per UOM
CREATE TABLE IF NOT EXISTS product_uom_prices (
    product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    uom_id     INT NOT NULL REFERENCES units_of_measure(uom_id) ON DELETE CASCADE,
    price      NUMERIC(18, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, uom_id)
);

CREATE INDEX IF NOT EXISTS idx_product_uom_prices_product ON product_uom_prices(product_id);
CREATE INDEX IF NOT EXISTS idx_product_uom_prices_uom ON product_uom_prices(uom_id);

COMMENT ON TABLE product_uom_prices IS 'Selling price per product per unit of measure. If no row exists for a UOM, use products.selling_price (default UOM).';
