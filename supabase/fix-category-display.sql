-- Kategori isimleri + yari mamul vitrin
-- Supabase SQL Editor → Run

UPDATE categories SET
  name_tr = 'Kutu Tatlılar',
  name_ru = 'Десерты в коробке',
  name_kk = 'Қораптағы десерттер',
  name_en = 'Box Desserts'
WHERE slug = 'packaged-desserts';

UPDATE categories SET show_on_home = true WHERE slug = 'semi-finished';

UPDATE categories SET show_on_home = false WHERE slug = 'frozen-boreks';
