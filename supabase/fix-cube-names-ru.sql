-- Küp ürünler — Rusça isim düzeltmesi (Supabase SQL Editor)
-- Vişne / fıstık küp: Latin yerine Kiril

UPDATE products
SET name_ru = 'Вишневый куб'
WHERE slug = 'pack-cherry-brownie';

UPDATE products
SET name_ru = 'Фисташково-малиновый куб'
WHERE slug = 'pack-pistachio-raspberry';

UPDATE products
SET name_kk = 'Шие куб'
WHERE slug = 'pack-cherry-brownie';

UPDATE products
SET name_kk = 'Фисташка-малина куб'
WHERE slug = 'pack-pistachio-raspberry';

SELECT slug, name_ru, name_kk
FROM products
WHERE slug IN ('pack-cherry-brownie', 'pack-pistachio-raspberry');
