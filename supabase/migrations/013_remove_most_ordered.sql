-- "En cok siparis edilen" / most_ordered vitrin bolumunu kaldir

DELETE FROM storefront_sections WHERE key = 'most_ordered';

ALTER TABLE storefront_sections DROP CONSTRAINT IF EXISTS storefront_sections_key_check;

ALTER TABLE storefront_sections ADD CONSTRAINT storefront_sections_key_check
  CHECK (key IN ('todays_favorites', 'new_collection', 'chefs_selection'));
