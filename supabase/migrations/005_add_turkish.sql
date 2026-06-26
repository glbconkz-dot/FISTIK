-- Add Turkish language columns

ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_tr text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_tr text NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_tr text NOT NULL DEFAULT '';

UPDATE categories SET name_tr = name_en WHERE name_tr = '';
UPDATE products SET name_tr = name_en WHERE name_tr = '';
UPDATE products SET description_tr = description_en WHERE description_tr = '';
