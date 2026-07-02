-- Turtalar — ayri kategori (elma cevizli + snickers turta)

ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_tr text NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_on_home boolean NOT NULL DEFAULT true;

INSERT INTO categories (slug, name_en, name_ru, name_kk, name_tr, sort_order, is_active, show_on_home)
VALUES ('turtas', 'Turtas', 'Турты', 'Турталар', 'Turtalar', 6, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ru = EXCLUDED.name_ru,
  name_kk = EXCLUDED.name_kk,
  name_tr = EXCLUDED.name_tr,
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  show_on_home = true;

UPDATE categories SET sort_order = 7 WHERE slug = 'american-cakes';
UPDATE categories SET sort_order = 8 WHERE slug = 'classic-round-cakes';
UPDATE categories SET sort_order = 9 WHERE slug = 'pies';
UPDATE categories SET sort_order = 10 WHERE slug = 'cookies';
UPDATE categories SET sort_order = 11 WHERE slug = 'boreks';
UPDATE categories SET sort_order = 12 WHERE slug = 'samsa';
UPDATE categories SET sort_order = 13 WHERE slug = 'frozen-boreks';
UPDATE categories SET sort_order = 14 WHERE slug = 'semi-finished';

UPDATE products SET
  category_id = (SELECT id FROM categories WHERE slug = 'turtas' LIMIT 1),
  sort_order = 1,
  name_en = 'Apple Walnut Turta',
  name_ru = 'Турта яблоко-орех-корица',
  name_tr = 'Elma Cevizli Turta',
  name_kk = 'Алма-жорға-корицалы турта'
WHERE slug = 'pie-apple-walnut-cinnamon';

UPDATE products SET
  category_id = (SELECT id FROM categories WHERE slug = 'turtas' LIMIT 1),
  sort_order = 2,
  name_en = 'Snickers Turta',
  name_ru = 'Турта Snickers',
  name_tr = 'Snickers Turta',
  name_kk = 'Snickers турта'
WHERE slug = 'pie-snickers';
