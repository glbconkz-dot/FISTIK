-- Remove unused storefront sections from admin / site

DELETE FROM storefront_sections WHERE key IN ('new_collection', 'chefs_selection');

ALTER TABLE storefront_sections DROP CONSTRAINT IF EXISTS storefront_sections_key_check;

ALTER TABLE storefront_sections ADD CONSTRAINT storefront_sections_key_check
  CHECK (key IN ('todays_favorites'));
