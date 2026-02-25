-- =============================================================================
-- Seed product_uom_prices: per-UOM prices for each product.
-- Run after 07_migration_product_uom_prices.sql. Idempotent (INSERT ON CONFLICT).
-- =============================================================================

-- 1) Backfill: ensure every product has at least its default UOM price from products.selling_price
INSERT INTO product_uom_prices (product_id, uom_id, price, updated_at)
SELECT p.product_id, p.uom_id, p.selling_price, CURRENT_TIMESTAMP
FROM products p
WHERE p.deleted_at IS NULL
  AND NOT EXISTS (SELECT 1 FROM product_uom_prices pup WHERE pup.product_id = p.product_id AND pup.uom_id = p.uom_id)
ON CONFLICT (product_id, uom_id) DO NOTHING;

-- 2) Register No 500 Narrow Line (code 491) — exact price list per unit type (PKR)
-- Pcs 10, Dozen 110, Gurus 1100, Kg 400, Ream 200, Packet 450, Roll 150
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

-- 3) Register No 500 Broad Line (490) — similar structure, different prices (PKR)
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

-- 4) Ring Register No 500 Broad Line (530)
INSERT INTO product_uom_prices (product_id, uom_id, price, updated_at)
SELECT p.product_id, u.uom_id, v.price, CURRENT_TIMESTAMP
FROM products p
CROSS JOIN LATERAL (VALUES
  ('Pcs',    18),
  ('Dozen',  198),
  ('Gurus',  1980),
  ('Kg',     NULL),
  ('Ream',   NULL),
  ('Packet', 350),
  ('Roll',   180)
) AS v(uom_name, price)
JOIN units_of_measure u ON u.name = v.uom_name
WHERE p.code = '530' AND p.deleted_at IS NULL AND v.price IS NOT NULL
ON CONFLICT (product_id, uom_id) DO UPDATE SET price = EXCLUDED.price, updated_at = EXCLUDED.updated_at;

-- 5) Copy No 200 4 Line Munir (208)
INSERT INTO product_uom_prices (product_id, uom_id, price, updated_at)
SELECT p.product_id, u.uom_id, v.price, CURRENT_TIMESTAMP
FROM products p
CROSS JOIN LATERAL (VALUES
  ('Pcs',    55),
  ('Dozen',  624),
  ('Gurus',  NULL),
  ('Kg',     NULL),
  ('Ream',   520),
  ('Packet', 600),
  ('Roll',   NULL)
) AS v(uom_name, price)
JOIN units_of_measure u ON u.name = v.uom_name
WHERE p.code = '208' AND p.deleted_at IS NULL AND v.price IS NOT NULL
ON CONFLICT (product_id, uom_id) DO UPDATE SET price = EXCLUDED.price, updated_at = EXCLUDED.updated_at;

-- 6) Register No 500 Khilarol (403)
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
