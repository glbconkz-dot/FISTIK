-- FISTIK — Marka kategori adlari + yari mamul birlestirme (canli Supabase SQL Editor)

UPDATE categories SET
  name_en = 'Cube Portion Desserts',
  name_tr = 'Küp Porsiyon Pastalar',
  name_ru = 'Порционные торты в кубе',
  name_kk = 'Кубтағы порциялық торттар'
WHERE slug = 'packaged-desserts';

UPDATE categories SET
  name_en = 'Rectangular Box Cakes',
  name_tr = 'Box Dikdörtgen Pastalar',
  name_ru = 'Прямоугольные торты в боксах',
  name_kk = 'Қораптағы тіктөртбұрышты торттар'
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
