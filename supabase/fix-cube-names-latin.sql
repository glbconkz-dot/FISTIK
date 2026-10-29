-- Küp porsiyon tatlılar — tüm dillerde aynı Latin isim (Supabase SQL Editor)

UPDATE products SET
  name_en = 'Tiramisu Cube',
  name_ru = 'Tiramisu Cube',
  name_kk = 'Tiramisu Cube',
  name_tr = 'Tiramisu Cube'
WHERE slug = 'pack-tiramisu';

UPDATE products SET
  name_en = 'Strawberry Cube',
  name_ru = 'Strawberry Cube',
  name_kk = 'Strawberry Cube',
  name_tr = 'Strawberry Cube'
WHERE slug = 'pack-strawberry-cake';

UPDATE products SET
  name_en = 'Crunch Cube',
  name_ru = 'Crunch Cube',
  name_kk = 'Crunch Cube',
  name_tr = 'Crunch Cube'
WHERE slug = 'pack-crunch';

UPDATE products SET
  name_en = 'Lotus Cube',
  name_ru = 'Lotus Cube',
  name_kk = 'Lotus Cube',
  name_tr = 'Lotus Cube'
WHERE slug = 'pack-lotus';

UPDATE products SET
  name_en = 'Cherry Cube',
  name_ru = 'Cherry Cube',
  name_kk = 'Cherry Cube',
  name_tr = 'Cherry Cube'
WHERE slug = 'pack-cherry-brownie';

UPDATE products SET
  name_en = 'Pistachio Cube',
  name_ru = 'Pistachio Cube',
  name_kk = 'Pistachio Cube',
  name_tr = 'Pistachio Cube'
WHERE slug = 'pack-pistachio-raspberry';

UPDATE products SET
  name_en = 'Oreo Cube',
  name_ru = 'Oreo Cube',
  name_kk = 'Oreo Cube',
  name_tr = 'Oreo Cube'
WHERE slug = 'pack-oreo';

UPDATE products SET
  name_en = 'Merenga Cube',
  name_ru = 'Merenga Cube',
  name_kk = 'Merenga Cube',
  name_tr = 'Merenga Cube'
WHERE slug = 'pack-meringue-cake';

SELECT slug, name_en, name_ru, name_kk, name_tr
FROM products
WHERE slug IN (
  'pack-tiramisu',
  'pack-strawberry-cake',
  'pack-crunch',
  'pack-lotus',
  'pack-cherry-brownie',
  'pack-pistachio-raspberry',
  'pack-oreo',
  'pack-meringue-cake'
)
ORDER BY sort_order;
