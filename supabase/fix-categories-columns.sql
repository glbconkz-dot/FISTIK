-- Kategori kapak gorseli + ana sayfa vitrin (eksik sutun hatasi icin)
-- Supabase SQL Editor → Run

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS image_url text NOT NULL DEFAULT '';

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS show_on_home boolean NOT NULL DEFAULT true;

UPDATE categories SET show_on_home = false WHERE slug IN ('semi-finished', 'eclairs-mini');

SELECT slug, image_url, show_on_home FROM categories ORDER BY sort_order LIMIT 5;
