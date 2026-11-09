-- Archive selected items from public B2C/B2B menus. Rows stay in admin for later.
-- Mini Ekler category stays active so the group remains visible in admin.

UPDATE products
SET is_active = false
WHERE slug IN (
  'pack-crunch',
  'pack-oreo',
  'art-hamburger',
  'tart-dark-chocolate',
  'eclair-mini-pistachio',
  'eclair-mini-hazelnut',
  'eclair-mini-vanilla',
  'eclair-mini-mastic',
  'eclair-mini-strawberry',
  'eclair-mini-raspberry',
  'eclair-mini-cherry',
  'eclair-mini-pineapple'
);
