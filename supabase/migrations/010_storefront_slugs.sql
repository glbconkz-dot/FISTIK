-- Vitrin: urun slug'lari (UUID'den daha guvenilir, admin-site senkronu)

ALTER TABLE storefront_sections
  ADD COLUMN IF NOT EXISTS product_slugs text[] NOT NULL DEFAULT '{}';

-- Mevcut UUID kayitlarindan slug doldur (varsa)
UPDATE storefront_sections AS s
SET product_slugs = COALESCE(
  (
    SELECT array_agg(p.slug ORDER BY u.ord)
    FROM unnest(s.product_ids) WITH ORDINALITY AS u(id, ord)
    JOIN products p ON p.id = u.id
  ),
  '{}'::text[]
)
WHERE cardinality(product_slugs) = 0 AND cardinality(product_ids) > 0;
