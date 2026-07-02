-- FISTIK — Marka kategori adlari + yari mamul birlestirme (canli Supabase SQL Editor)

UPDATE categories SET
  name_en = 'FISTIK Cube',
  name_tr = 'FISTIK Cube',
  name_ru = 'ФЫСТЫК Куб',
  name_kk = 'ФЫСТЫҚ Куб'
WHERE slug = 'packaged-desserts';

UPDATE categories SET
  name_en = 'FISTIK Elite',
  name_tr = 'FISTIK Elite',
  name_ru = 'ФЫСТЫК Элит',
  name_kk = 'ФЫСТЫҚ Элит'
WHERE slug = 'american-cakes';

UPDATE categories SET
  name_en = 'FISTIK Grolet',
  name_tr = 'FISTIK Grolet',
  name_ru = 'ФЫСТЫК Гролет',
  name_kk = 'ФЫСТЫҚ Гролет'
WHERE slug = 'art-desserts';

UPDATE categories SET
  name_en = 'Semi-finished Products',
  name_tr = 'Yarı Mamul Ürünler',
  name_ru = 'Полуфабрикаты',
  name_kk = 'Полуфабрикаты',
  show_on_home = true
WHERE slug = 'semi-finished';

UPDATE categories SET
  name_en = 'Semi-finished Products',
  name_tr = 'Yarı Mamul Ürünler',
  name_ru = 'Полуфабрикаты',
  name_kk = 'Полуфабрикаты',
  show_on_home = false
WHERE slug = 'frozen-boreks';
