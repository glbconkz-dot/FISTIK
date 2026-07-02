-- =============================================================================
-- FISTIK — Elma ve Snickers tartlari Piroglardan ayir (KOPYALA-YAPISTIR)
-- =============================================================================
-- Supabase → SQL Editor → Run
--
-- pie-apple-walnut-cinnamon ve pie-snickers → Tartlar (tarts) kategorisi
-- =============================================================================

UPDATE products SET
  category_id = (SELECT id FROM categories WHERE slug = 'tarts'),
  sort_order = CASE slug
    WHEN 'pie-apple-walnut-cinnamon' THEN 5
    WHEN 'pie-snickers' THEN 6
  END,
  name_en = CASE slug
    WHEN 'pie-apple-walnut-cinnamon' THEN 'Apple Walnut Cinnamon Tart'
    WHEN 'pie-snickers' THEN 'Snickers Tart'
  END,
  name_ru = CASE slug
    WHEN 'pie-apple-walnut-cinnamon' THEN 'Тарт яблоко-орех-корица'
    WHEN 'pie-snickers' THEN 'Тарт Snickers'
  END,
  name_tr = CASE slug
    WHEN 'pie-apple-walnut-cinnamon' THEN 'Elma Ceviz Tarçınlı Tart'
    WHEN 'pie-snickers' THEN 'Snickers Tart'
  END,
  name_kk = CASE slug
    WHEN 'pie-apple-walnut-cinnamon' THEN 'Алма-жорға-корицалы тарт'
    WHEN 'pie-snickers' THEN 'Snickers тарт'
  END
WHERE slug IN ('pie-apple-walnut-cinnamon', 'pie-snickers');

-- Kalan piroglarin sira numaralari
UPDATE products SET sort_order = CASE slug
  WHEN 'pie-quark' THEN 1
  WHEN 'pie-meat' THEN 2
  WHEN 'pie-chicken' THEN 3
  WHEN 'pie-spinach-cheese' THEN 4
  WHEN 'pie-cheese' THEN 5
END
WHERE slug IN ('pie-quark', 'pie-meat', 'pie-chicken', 'pie-spinach-cheese', 'pie-cheese');

-- Kontrol
SELECT c.slug AS category, p.slug, p.name_tr, p.sort_order
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.slug IN ('pie-apple-walnut-cinnamon', 'pie-snickers', 'pie-quark', 'pie-meat')
ORDER BY c.slug, p.sort_order;
