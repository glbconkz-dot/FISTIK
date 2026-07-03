-- FISTIK — Canli ortam tamamlama (setup-step1 + 004 sonrasi TEK SEFER)
-- Supabase SQL Editor → yapistir → Run
-- Guvenli: IF NOT EXISTS / ON CONFLICT — tekrar calistirmak sorun cikarmaz

-- ── 1) Stok + siparis stok bayragi ─────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_quantity integer NOT NULL DEFAULT 0
  CHECK (stock_quantity >= 0);

CREATE INDEX IF NOT EXISTS products_stock_quantity_idx ON products (stock_quantity);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stock_deducted boolean NOT NULL DEFAULT false;

-- ── 2) Siparis akisi (onay / sevkiyat / iptal) ───────────────────────────
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason text NOT NULL DEFAULT '';

DO $$ BEGIN
  ALTER TYPE order_status ADD VALUE 'shipped';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── 3) Kategori kapak + ana sayfa vitrin tablosu ─────────────────────────
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_on_home boolean NOT NULL DEFAULT true;

UPDATE categories SET
  name_en = 'Pies', name_ru = 'Пироги', name_kk = 'Пирогтар', name_tr = 'Turtalar'
WHERE slug = 'pies';

UPDATE categories SET name_ru = 'Печенье', name_tr = 'Kurabiyeler' WHERE slug = 'cookies';
UPDATE categories SET name_ru = 'Бореки', name_tr = 'Börekler' WHERE slug = 'boreks';
UPDATE categories SET
  name_ru = 'Прямоугольные торты в боксах',
  name_tr = 'Box Dikdörtgen Pastalar',
  name_en = 'Rectangular Box Cakes',
  name_kk = 'Қораптағы тіктөртбұрышты торттар'
WHERE slug = 'american-cakes';
UPDATE categories SET
  name_ru = 'Торты', name_tr = 'Yaş Pasta', name_en = 'Gateau', name_kk = 'Торттар'
WHERE slug = 'classic-round-cakes';

UPDATE categories SET show_on_home = false WHERE slug IN ('semi-finished', 'eclairs-mini');

CREATE TABLE IF NOT EXISTS storefront_sections (
  key text PRIMARY KEY CHECK (key IN ('todays_favorites', 'new_collection', 'chefs_selection')),
  product_ids uuid[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO storefront_sections (key) VALUES
  ('todays_favorites'), ('new_collection'), ('chefs_selection')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE storefront_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read storefront_sections" ON storefront_sections;
DROP POLICY IF EXISTS "Admin manage storefront_sections" ON storefront_sections;
CREATE POLICY "Public read storefront_sections" ON storefront_sections FOR SELECT USING (true);
CREATE POLICY "Admin manage storefront_sections" ON storefront_sections
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Slug tabanli vitrin (admin <-> site senkronu)
ALTER TABLE storefront_sections
  ADD COLUMN IF NOT EXISTS product_slugs text[] NOT NULL DEFAULT '{}';

-- ── 4) Turkce urun isimleri ──────────────────────────────────────────────
-- fix-product-names-tr.sql ile ayni (ozet). Tam liste icin o dosyayi da calistirabilirsiniz.

-- ── 5) Rusca isimler — migrations/008_fix_localized_names.sql dosyasini
--     hemen ardindan calistirin (buyuk UPDATE blogu).
