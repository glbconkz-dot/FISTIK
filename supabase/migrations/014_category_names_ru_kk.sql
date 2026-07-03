-- Kategori isimleri (RU/KK listeye gore)

UPDATE categories SET name_en = 'Large Eclairs', name_tr = 'Büyük Ekler', name_ru = 'Эклеры', name_kk = 'Эклерлер' WHERE slug = 'eclairs-large';

UPDATE categories SET name_en = 'Mini Eclairs', name_tr = 'Mini Ekler', name_ru = 'Мини-эклеры', name_kk = 'Мини-эклерлер' WHERE slug = 'eclairs-mini';

UPDATE categories SET name_en = 'Cube Portion Desserts', name_tr = 'Küp Porsiyon Pastalar', name_ru = 'Порционные торты в кубе', name_kk = 'Кубтағы порциялық торттар' WHERE slug = 'packaged-desserts';

UPDATE categories SET name_en = 'Art Desserts', name_tr = 'Art Desserts', name_ru = 'Арт-десерты', name_kk = 'Арт-десерттер' WHERE slug = 'art-desserts';

UPDATE categories SET name_en = 'Tarts', name_tr = 'Tartlar', name_ru = 'Тарты', name_kk = 'Тарттар' WHERE slug = 'tarts';

UPDATE categories SET name_en = 'Turtas', name_tr = 'Turtalar', name_ru = 'Сладкие пироги', name_kk = 'Тәтті пирогтар' WHERE slug = 'turtas';

UPDATE categories SET name_en = 'Rectangular Box Cakes', name_tr = 'Box Dikdörtgen Pastalar', name_ru = 'Прямоугольные торты в боксах', name_kk = 'Қораптағы тіктөртбұрышты торттар' WHERE slug = 'american-cakes';

UPDATE categories SET name_en = 'Gateau', name_tr = 'Yaş Pasta', name_ru = 'Торты', name_kk = 'Торттар' WHERE slug = 'classic-round-cakes';

UPDATE categories SET name_en = 'Cookies', name_tr = 'Kurabiyeler', name_ru = 'Печенья', name_kk = 'Печеньелер' WHERE slug = 'cookies';

SELECT slug, name_en, name_tr, name_ru, name_kk FROM categories
WHERE slug IN (
  'eclairs-large', 'eclairs-mini', 'packaged-desserts', 'art-desserts',
  'tarts', 'turtas', 'american-cakes', 'classic-round-cakes', 'cookies'
)
ORDER BY sort_order;
