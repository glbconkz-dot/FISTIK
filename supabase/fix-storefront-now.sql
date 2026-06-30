-- FISTIK — Vitrin tablosu (admin Ana Sayfa Vitrini icin ZORUNLU)
-- Supabase Dashboard → SQL Editor → yapistir → Run
-- Guvenli: tekrar calistirmak sorun cikarmaz

CREATE TABLE IF NOT EXISTS storefront_sections (
  key text PRIMARY KEY CHECK (key IN (
    'todays_favorites',
    'new_collection',
    'most_ordered',
    'chefs_selection'
  )),
  product_ids uuid[] NOT NULL DEFAULT '{}',
  product_slugs text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO storefront_sections (key) VALUES
  ('todays_favorites'),
  ('new_collection'),
  ('most_ordered'),
  ('chefs_selection')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE storefront_sections
  ADD COLUMN IF NOT EXISTS product_slugs text[] NOT NULL DEFAULT '{}';

ALTER TABLE storefront_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read storefront_sections" ON storefront_sections;
CREATE POLICY "Public read storefront_sections"
  ON storefront_sections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage storefront_sections" ON storefront_sections;
CREATE POLICY "Admin manage storefront_sections"
  ON storefront_sections
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Dogrulama (4 satir donmeli)
SELECT key, product_ids, product_slugs, updated_at FROM storefront_sections ORDER BY key;
