-- Canlı sitede tüm ürünler "tükendi" görünüyorsa — bir kez çalıştırın
-- Supabase SQL Editor → New query → Run

UPDATE products
SET stock_quantity = 30
WHERE stock_quantity = 0 OR stock_quantity IS NULL;

-- Kontrol (0 stok kalmamalı):
-- SELECT slug, stock_quantity FROM products ORDER BY sort_order LIMIT 20;
