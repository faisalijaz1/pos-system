-- =============================================================================
-- Seed products, UOMs, brands, categories (safe to run on existing DB)
-- Run when /api/v1/products returns empty. Use: docker compose exec postgres psql -U pos_user -d pos_db -f /docker-entrypoint-initdb.d/03_seed_products.sql
-- =============================================================================

-- UOMs (skip if already present)
INSERT INTO units_of_measure (name, symbol)
VALUES ('Pcs', 'pcs'), ('Dozen', 'doz'), ('Gurus', 'gurus'), ('Kg', 'kg'), ('Ream', 'ream'), ('Packet', 'pkt'), ('Roll', 'roll'), ('Dasta', 'dasta'), ('Rim', 'rim')
ON CONFLICT (name) DO NOTHING;

-- Brands
INSERT INTO brands (name)
VALUES ('Teetar'), ('Munir'), ('Rang Register')
ON CONFLICT (name) DO NOTHING;

-- Categories
INSERT INTO categories (name)
VALUES ('Card Register'), ('Ring Register'), ('Stationery')
ON CONFLICT (name) DO NOTHING;

-- Sample products (skip if code already exists)
INSERT INTO products (code, name_en, name_ur, brand_id, category_id, uom_id, min_stock_level, cost_price, selling_price, current_stock)
SELECT '490', 'Register No 500 Broad Line', 'رجسٹر نمبر 500 براڈ لائن', (SELECT brand_id FROM brands WHERE name = 'Teetar' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Card Register' LIMIT 1), (SELECT uom_id FROM units_of_measure WHERE name = 'Dozen' LIMIT 1), 5, 2000, 2196, 5604
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = '490');
INSERT INTO products (code, name_en, name_ur, brand_id, category_id, uom_id, min_stock_level, cost_price, selling_price, current_stock)
SELECT '491', 'Register No 500 Narrow Line', 'رجسٹر نمبر 500 نیرو لائن', (SELECT brand_id FROM brands WHERE name = 'Teetar' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Card Register' LIMIT 1), (SELECT uom_id FROM units_of_measure WHERE name = 'Dozen' LIMIT 1), 5, 2000, 2196, 358
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = '491');
INSERT INTO products (code, name_en, name_ur, brand_id, category_id, uom_id, min_stock_level, cost_price, selling_price, current_stock)
SELECT '530', 'Ring Register No 500 Broad Line', 'رنگ رجسٹر نمبر 500 براڈ لائن', (SELECT brand_id FROM brands WHERE name = 'Rang Register' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Ring Register' LIMIT 1), (SELECT uom_id FROM units_of_measure WHERE name = 'Dozen' LIMIT 1), 5, 1800, 1980, 86
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = '530');
INSERT INTO products (code, name_en, name_ur, brand_id, category_id, uom_id, min_stock_level, cost_price, selling_price, current_stock)
SELECT '208', 'Copy No 200 4 Line Munir', 'کاپی نمبر 200 4 لائن منیر', (SELECT brand_id FROM brands WHERE name = 'Munir' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Stationery' LIMIT 1), (SELECT uom_id FROM units_of_measure WHERE name = 'Dozen' LIMIT 1), 5, 550, 624, 1200
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = '208');
INSERT INTO products (code, name_en, name_ur, brand_id, category_id, uom_id, min_stock_level, cost_price, selling_price, current_stock)
SELECT '403', 'Register No 500 Khilarol', 'رجسٹر نمبر 500 كهلارول', (SELECT brand_id FROM brands WHERE name = 'Munir' LIMIT 1), (SELECT category_id FROM categories WHERE name = 'Card Register' LIMIT 1), (SELECT uom_id FROM units_of_measure WHERE name = 'Dozen' LIMIT 1), 5, 2000, 2196, 5604
WHERE NOT EXISTS (SELECT 1 FROM products WHERE code = '403');
