-- Kategori kapak gorselleri + ana sayfa vitrin bolumleri

ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_on_home boolean NOT NULL DEFAULT true;

-- Yanlis birlestirilmis isimleri duzelt (pies != borek)
UPDATE categories SET
  name_en = 'Pies',
  name_ru = 'Пироги',
  name_kk = 'Пирогтар',
  name_tr = 'Turtalar'
WHERE slug = 'pies';

UPDATE categories SET
  name_ru = 'Печенье',
  name_tr = 'Kurabiyeler'
WHERE slug = 'cookies';

UPDATE categories SET
  name_ru = 'Блины / Бореки',
  name_tr = 'Börekler'
WHERE slug = 'boreks';

-- Ana sayfa kategori gridinde gereksiz teknik kategorileri gizle
UPDATE categories SET show_on_home = false WHERE slug IN ('semi-finished', 'eclairs-mini');

CREATE TABLE IF NOT EXISTS storefront_sections (
  key text PRIMARY KEY CHECK (key IN ('todays_favorites', 'new_collection', 'most_ordered', 'chefs_selection')),
  product_ids uuid[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO storefront_sections (key) VALUES
  ('todays_favorites'),
  ('new_collection'),
  ('most_ordered'),
  ('chefs_selection')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE storefront_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read storefront_sections" ON storefront_sections;
DROP POLICY IF EXISTS "Admin manage storefront_sections" ON storefront_sections;

CREATE POLICY "Public read storefront_sections" ON storefront_sections
  FOR SELECT USING (true);

CREATE POLICY "Admin manage storefront_sections" ON storefront_sections
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
