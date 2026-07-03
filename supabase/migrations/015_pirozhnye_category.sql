-- Pirozhnye — ayri kategori (eskimo + potato urunleri)

INSERT INTO categories (slug, name_en, name_ru, name_kk, name_tr, sort_order, is_active, show_on_home)
VALUES ('pirozhnye', 'Pastries', 'Пирожные', 'Пирожныйлар', 'Mono Cakes', 6, true, true)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ru = EXCLUDED.name_ru,
  name_kk = EXCLUDED.name_kk,
  name_tr = EXCLUDED.name_tr,
  sort_order = 6,
  is_active = true,
  show_on_home = true;

UPDATE categories SET sort_order = 4 WHERE slug = 'american-cakes';
UPDATE categories SET sort_order = 5 WHERE slug = 'art-desserts';
UPDATE categories SET sort_order = 6 WHERE slug = 'pirozhnye';
UPDATE categories SET sort_order = 7 WHERE slug = 'tarts';
UPDATE categories SET sort_order = 8 WHERE slug = 'cookies';
UPDATE categories SET sort_order = 9 WHERE slug = 'turtas';
UPDATE categories SET sort_order = 10 WHERE slug = 'classic-round-cakes';
UPDATE categories SET sort_order = 11 WHERE slug = 'pies';
UPDATE categories SET sort_order = 12 WHERE slug = 'boreks';
UPDATE categories SET sort_order = 13 WHERE slug = 'samsa';
UPDATE categories SET sort_order = 14 WHERE slug = 'semi-finished';
UPDATE categories SET sort_order = 15 WHERE slug = 'frozen-boreks';

UPDATE products SET
  category_id = (SELECT id FROM categories WHERE slug = 'pirozhnye'),
  is_active = true
WHERE slug IN (
  'eskimo-dubai', 'eskimo-strawberry', 'eskimo-oreo', 'eskimo-caramel',
  'kartoshka-dubai', 'kartoshka-strawberry', 'kartoshka-oreo', 'kartoshka-caramel'
);

UPDATE products SET
  category_id = (SELECT id FROM categories WHERE slug = 'american-cakes'),
  is_active = true
WHERE slug IN (
  'american-tiramisu', 'american-strawberry-cake', 'american-lotus',
  'american-cherry-brownie', 'american-pistachio-raspberry',
  'mango-coconut-mousse', 'ferrero-hazelnut-mousse'
);
