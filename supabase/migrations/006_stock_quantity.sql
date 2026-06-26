-- FISTIK — Online satış stok adedi
-- Supabase SQL Editor'de bir kez çalıştırın. Sonra 007_stock_on_confirm.sql

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 30
  CHECK (stock_quantity >= 0);

CREATE INDEX IF NOT EXISTS products_stock_quantity_idx ON products (stock_quantity);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stock_deducted boolean NOT NULL DEFAULT false;
