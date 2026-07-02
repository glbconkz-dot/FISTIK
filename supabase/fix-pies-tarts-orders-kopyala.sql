-- =============================================================================
-- FISTIK — Piroglar / Tartlar ayri + siparis gecmisi temizligi (KOPYALA-YAPISTIR)
-- =============================================================================
-- Supabase → SQL Editor → Run
--
-- 1) Piroglar (pies) ve Tartlar (tarts) ayri isimler
-- 2) Tamamlanan + iptal edilen siparisler silinir (yeni/onayli kalir)
-- =============================================================================

-- Piroglar (tatli/tuzlu pirog)
UPDATE categories SET
  name_en = 'Pies',
  name_tr = 'Piroglar',
  name_ru = 'Пироги',
  name_kk = 'Пирогтар',
  show_on_home = true
WHERE slug = 'pies';

-- Tartlar (ayri kategori)
UPDATE categories SET
  name_en = 'Tarts',
  name_tr = 'Tartlar',
  name_ru = 'Тарты',
  name_kk = 'Тарттар',
  show_on_home = true
WHERE slug = 'tarts';

-- Yanlis kategoride kalan urun yoksa atla; pirog urunleri pies altinda kalmali
-- (Gerekirse admin panelden tek tek duzeltin)

-- Siparis gecmisi: teslim edilen + iptal edilen
DELETE FROM orders
WHERE status IN ('completed', 'cancelled');

-- Admin panelden silme icin (bir kez calistirin)
DROP POLICY IF EXISTS "Admin can delete orders" ON orders;
CREATE POLICY "Admin can delete orders"
  ON orders FOR DELETE
  USING (is_admin());

-- Kontrol
SELECT slug, name_tr, name_ru, name_kk FROM categories
WHERE slug IN ('pies', 'tarts')
ORDER BY sort_order;

SELECT status, COUNT(*) AS adet FROM orders GROUP BY status ORDER BY status;
