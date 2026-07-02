-- Elma + Snickers -> Tartlar. Supabase SQL Editor: BLOK 1, sonra BLOK 2, sonra BLOK 3 (ayri ayri Run).

-- BLOK 1
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_tr text NOT NULL DEFAULT '';

-- BLOK 2 (kategori tasima)
UPDATE products
SET
  category_id = (SELECT id FROM categories WHERE slug = 'tarts' LIMIT 1),
  sort_order = 5
WHERE slug = 'pie-apple-walnut-cinnamon';

UPDATE products
SET
  category_id = (SELECT id FROM categories WHERE slug = 'tarts' LIMIT 1),
  sort_order = 6
WHERE slug = 'pie-snickers';

UPDATE products SET sort_order = 1 WHERE slug = 'pie-quark';
UPDATE products SET sort_order = 2 WHERE slug = 'pie-meat';
UPDATE products SET sort_order = 3 WHERE slug = 'pie-chicken';
UPDATE products SET sort_order = 4 WHERE slug = 'pie-spinach-cheese';
UPDATE products SET sort_order = 5 WHERE slug = 'pie-cheese';

-- BLOK 3 (isimler)
UPDATE products SET
  name_en = 'Apple Walnut Cinnamon Tart',
  name_ru = 'Тарт яблоко-орех-корица',
  name_tr = 'Elma Ceviz Tarçınlı Tart',
  name_kk = 'Алма-жорға-корицалы тарт'
WHERE slug = 'pie-apple-walnut-cinnamon';

UPDATE products SET
  name_en = 'Snickers Tart',
  name_ru = 'Тарт Snickers',
  name_tr = 'Snickers Tart',
  name_kk = 'Snickers тарт'
WHERE slug = 'pie-snickers';

-- BLOK 4 (kontrol)
SELECT c.slug AS category, p.slug, p.name_tr, p.sort_order
FROM products p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.slug IN ('pie-apple-walnut-cinnamon', 'pie-snickers', 'pie-quark')
ORDER BY c.slug, p.sort_order;
