-- =============================================================================
-- RUN ON RAILWAY POSTGRES: Unit-specific product prices (migration + seed)
-- Run this script in Railway PostgreSQL (or any PostgreSQL) to add product_uom_prices
-- and seed prices for Register No 500 Narrow Line and other products.
-- Idempotent — safe to run multiple times.
-- =============================================================================

-- -------- Migration: table product_uom_prices --------
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

-- -------- Seed: backfill default UOM price from products.selling_price --------
INSERT INTO product_uom_prices (product_id, uom_id, price, updated_at)
SELECT p.product_id, p.uom_id, p.selling_price, CURRENT_TIMESTAMP
FROM products p
WHERE p.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM product_uom_prices pup WHERE pup.product_id = p.product_id AND pup.uom_id = p.uom_id)
ON CONFLICT (product_id, uom_id) DO NOTHING;

-- -------- Register No 500 Narrow Line (code 491) — PKR: Pcs 10, Dozen 110, Gurus 1100, Kg 400, Ream 200, Packet 450, Roll 150 --------
INSERT INTO product_uom_prices (product_id, uom_id, price, updated_at)
SELECT p.product_id, u.uom_id, v.price, CURRENT_TIMESTAMP
FROM products p
CROSS JOIN LATERAL (VALUES
  ('Pcs',    10),
  ('Dozen',  110),
  ('Gurus',  1100),
  ('Kg',     400),
  ('Ream',   200),
  ('Packet', 450),
  ('Roll',   150)
) AS v(uom_name, price)
JOIN units_of_measure u ON u.name = v.uom_name
WHERE p.code = '491' AND p.deleted_at IS NULL
ON CONFLICT (product_id, uom_id) DO UPDATE SET price = EXCLUDED.price, updated_at = EXCLUDED.updated_at;

-- -------- Register No 500 Broad Line (490) --------
INSERT INTO product_uom_prices (product_id, uom_id, price, updated_at)
SELECT p.product_id, u.uom_id, v.price, CURRENT_TIMESTAMP
FROM products p
CROSS JOIN LATERAL (VALUES
  ('Pcs',    12),
  ('Dozen',  130),
  ('Gurus',  1200),
  ('Kg',     450),
  ('Ream',   220),
  ('Packet', 480),
  ('Roll',   160)
) AS v(uom_name, price)
JOIN units_of_measure u ON u.name = v.uom_name
WHERE p.code = '490' AND p.deleted_at IS NULL
ON CONFLICT (product_id, uom_id) DO UPDATE SET price = EXCLUDED.price, updated_at = EXCLUDED.updated_at;

-- -------- Ring Register No 500 Broad Line (530) --------
INSERT INTO product_uom_prices (product_id, uom_id, price, updated_at)
SELECT p.product_id, u.uom_id, v.price, CURRENT_TIMESTAMP
FROM products p
CROSS JOIN LATERAL (VALUES
  ('Pcs',    18),
  ('Dozen',  198),
  ('Gurus',  1980),
  ('Packet', 350),
  ('Roll',   180)
) AS v(uom_name, price)
JOIN units_of_measure u ON u.name = v.uom_name
WHERE p.code = '530' AND p.deleted_at IS NULL
ON CONFLICT (product_id, uom_id) DO UPDATE SET price = EXCLUDED.price, updated_at = EXCLUDED.updated_at;

-- -------- Copy No 200 4 Line Munir (208) --------
INSERT INTO product_uom_prices (product_id, uom_id, price, updated_at)
SELECT p.product_id, u.uom_id, v.price, CURRENT_TIMESTAMP
FROM products p
CROSS JOIN LATERAL (VALUES
  ('Pcs',    55),
  ('Dozen',  624),
  ('Ream',   520),
  ('Packet', 600)
) AS v(uom_name, price)
JOIN units_of_measure u ON u.name = v.uom_name
WHERE p.code = '208' AND p.deleted_at IS NULL
ON CONFLICT (product_id, uom_id) DO UPDATE SET price = EXCLUDED.price, updated_at = EXCLUDED.updated_at;

-- -------- Register No 500 Khilarol (403) --------
INSERT INTO product_uom_prices (product_id, uom_id, price, updated_at)
SELECT p.product_id, u.uom_id, v.price, CURRENT_TIMESTAMP
FROM products p
CROSS JOIN LATERAL (VALUES
  ('Pcs',    11),
  ('Dozen',  125),
  ('Gurus',  1150),
  ('Kg',     420),
  ('Ream',   210),
  ('Packet', 460),
  ('Roll',   155)
) AS v(uom_name, price)
JOIN units_of_measure u ON u.name = v.uom_name
WHERE p.code = '403' AND p.deleted_at IS NULL
ON CONFLICT (product_id, uom_id) DO UPDATE SET price = EXCLUDED.price, updated_at = EXCLUDED.updated_at;
