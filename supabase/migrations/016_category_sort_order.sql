-- Kategori siralamasi

UPDATE categories SET sort_order = 1 WHERE slug = 'eclairs-large';
UPDATE categories SET sort_order = 2 WHERE slug = 'eclairs-mini';
UPDATE categories SET sort_order = 3 WHERE slug = 'packaged-desserts';
UPDATE categories SET sort_order = 4 WHERE slug = 'american-cakes';
UPDATE categories SET sort_order = 5 WHERE slug = 'art-desserts';
UPDATE categories SET sort_order = 6 WHERE slug = 'pirozhnye';
UPDATE categories SET sort_order = 7 WHERE slug = 'tarts';
UPDATE categories SET sort_order = 8 WHERE slug = 'cookies';
UPDATE categories SET sort_order = 9 WHERE slug = 'turtas';
UPDATE categories SET sort_order = 10 WHERE slug = 'classic-round-cakes';
UPDATE categories SET sort_order = 11 WHERE slug = 'pies';
UPDATE categories SET sort_order = 12 WHERE slug = 'boreks';
UPDATE categories SET sort_order = 13 WHERE slug = 'samsa';
UPDATE categories SET sort_order = 14 WHERE slug = 'semi-finished';
UPDATE categories SET sort_order = 15 WHERE slug = 'frozen-boreks';

SELECT slug, name_tr, sort_order FROM categories ORDER BY sort_order;
