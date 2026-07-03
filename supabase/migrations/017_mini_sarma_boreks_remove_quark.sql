-- STEP 1: Run this alone first
DELETE FROM products WHERE slug IN ('pie-quark', 'kucuk-borek', 'sarma-borek');

-- STEP 2: Run this alone second
UPDATE products SET sort_order = 1 WHERE slug = 'pie-meat';
UPDATE products SET sort_order = 2 WHERE slug = 'pie-chicken';
UPDATE products SET sort_order = 3 WHERE slug = 'pie-spinach-cheese';
UPDATE products SET sort_order = 4 WHERE slug = 'pie-cheese';

-- STEP 3: Run this alone third (mini boreks)
INSERT INTO products (slug, category_id, name_en, name_ru, name_kk, name_tr, price, image_url, sort_order)
VALUES
  ('mini-borek-meat', (SELECT id FROM categories WHERE slug = 'frozen-boreks'), 'Meat Mini Borek', 'Мини борек с мясом', 'Мини борек етпен', 'Etli Mini Börek', 1500, '/products/boreks/borek.png', 7),
  ('mini-borek-chicken', (SELECT id FROM categories WHERE slug = 'frozen-boreks'), 'Chicken Mini Borek', 'Мини борек с курицей', 'Мини борек тауықпен', 'Tavuklu Mini Börek', 1500, '/products/boreks/borek.png', 8),
  ('mini-borek-potato', (SELECT id FROM categories WHERE slug = 'frozen-boreks'), 'Potato Mini Borek', 'Мини борек с картошкой', 'Мини борек картоппен', 'Patatesli Mini Börek', 1500, '/products/boreks/borek.png', 9),
  ('mini-borek-spinach', (SELECT id FROM categories WHERE slug = 'frozen-boreks'), 'Spinach Mini Borek', 'Мини борек со шпинатом', 'Мини борек спанатпен', 'Ispanaklı Mini Börek', 1500, '/products/boreks/borek.png', 10),
  ('mini-borek-brinza', (SELECT id FROM categories WHERE slug = 'frozen-boreks'), 'Cheese Mini Borek', 'Мини борек с брынзой', 'Мини борек брынзамен', 'Peynirli Mini Börek', 1500, '/products/boreks/borek.png', 11),
  ('mini-borek-lentils', (SELECT id FROM categories WHERE slug = 'frozen-boreks'), 'Lentil Mini Borek', 'Мини борек с чечевицей', 'Мини борек бұршақпен', 'Mercimekli Mini Börek', 1500, '/products/boreks/borek.png', 12)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_en = EXCLUDED.name_en,
  name_ru = EXCLUDED.name_ru,
  name_kk = EXCLUDED.name_kk,
  name_tr = EXCLUDED.name_tr,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_active = true;

-- STEP 4: Run this alone fourth (sarma boreks)
INSERT INTO products (slug, category_id, name_en, name_ru, name_kk, name_tr, price, image_url, sort_order)
VALUES
  ('sarma-borek-meat', (SELECT id FROM categories WHERE slug = 'frozen-boreks'), 'Meat Sarma Borek', 'Сарма борек с мясом', 'Сарма борек етпен', 'Etli Sarma Börek', 1500, '/products/boreks/borek.png', 13),
  ('sarma-borek-chicken', (SELECT id FROM categories WHERE slug = 'frozen-boreks'), 'Chicken Sarma Borek', 'Сарма борек с курицей', 'Сарма борек тауықпен', 'Tavuklu Sarma Börek', 1500, '/products/boreks/borek.png', 14),
  ('sarma-borek-brinza', (SELECT id FROM categories WHERE slug = 'frozen-boreks'), 'Cheese Sarma Borek', 'Сарма борек с брынзой', 'Сарма борек брынзамен', 'Peynirli Sarma Börek', 1500, '/products/boreks/borek.png', 15),
  ('sarma-borek-spinach', (SELECT id FROM categories WHERE slug = 'frozen-boreks'), 'Spinach Sarma Borek', 'Сарма борек со шпинатом', 'Сарма борек спанатпен', 'Ispanaklı Sarma Börek', 1500, '/products/boreks/borek.png', 16),
  ('sarma-borek-lentils', (SELECT id FROM categories WHERE slug = 'frozen-boreks'), 'Lentil Sarma Borek', 'Сарма борек с чечевицей', 'Сарма борек бұршақпен', 'Mercimekli Sarma Börek', 1500, '/products/boreks/borek.png', 17),
  ('sarma-borek-potato', (SELECT id FROM categories WHERE slug = 'frozen-boreks'), 'Potato Sarma Borek', 'Сарма борек с картошкой', 'Сарма борек картоппен', 'Patatesli Sarma Börek', 1500, '/products/boreks/borek.png', 18)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name_en = EXCLUDED.name_en,
  name_ru = EXCLUDED.name_ru,
  name_kk = EXCLUDED.name_kk,
  name_tr = EXCLUDED.name_tr,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_active = true;
