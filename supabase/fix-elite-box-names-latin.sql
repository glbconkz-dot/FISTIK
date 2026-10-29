-- Dikdörtgen box pastalar: tüm dillerde aynı Latin isim (Kiril kullanılmaz)
UPDATE products SET name_en = v.name, name_ru = v.name, name_kk = v.name, name_tr = v.name
FROM (VALUES
  ('american-tiramisu', 'Tiramisu Elite box'),
  ('american-strawberry-cake', 'Strawberry Elite box'),
  ('american-lotus', 'Lotus Elite box'),
  ('american-cherry-brownie', 'Cherry Elite box'),
  ('american-pistachio-raspberry', 'Pistachio Elite box'),
  ('mango-coconut-mousse', 'Mango Musse Elite box'),
  ('ferrero-hazelnut-mousse', 'Ferrero Musse Elite box')
) AS v(slug, name)
WHERE products.slug = v.slug;
