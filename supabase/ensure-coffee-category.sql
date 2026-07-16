-- FISTIK — B2C Kahve kategorisi (yoksa ekle)
INSERT INTO categories (
  slug,
  name_en,
  name_ru,
  name_kk,
  name_tr,
  sort_order,
  is_active,
  show_on_home
)
VALUES (
  'coffee',
  'Coffee',
  'Кофе',
  'Кофе',
  'Kahve',
  16,
  true,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ru = EXCLUDED.name_ru,
  name_kk = EXCLUDED.name_kk,
  name_tr = EXCLUDED.name_tr,
  is_active = true,
  show_on_home = true;
