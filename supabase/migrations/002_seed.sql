-- FISTIK Sample Seed Data (development)

INSERT INTO categories (slug, name_en, name_ru, name_kk, sort_order) VALUES
  ('cakes', 'Cakes', 'Торты', 'Торттар', 1),
  ('pastries', 'Pastries', 'Выпечка', 'Пісірімдер', 2),
  ('desserts', 'Desserts', 'Десерты', 'Десерттер', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (
  slug, category_id, name_en, name_ru, name_kk,
  description_en, description_ru, description_kk,
  price, image_url, sort_order
) VALUES
  (
    'chocolate-celebration-cake',
    (SELECT id FROM categories WHERE slug = 'cakes'),
    'Chocolate Celebration Cake',
    'Шоколадный праздничный торт',
    'Шоколадты мерекелік торт',
    'Rich dark chocolate layers with silky ganache and gold leaf accents.',
    'Насыщенные слои темного шоколада с шелковым ганашем и золотыми акцентами.',
    'Қою қара шоколад қабаттары, жібек ганаш және алтын акценттер.',
    8500.00,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    1
  ),
  (
    'vanilla-rose-cake',
    (SELECT id FROM categories WHERE slug = 'cakes'),
    'Vanilla Rose Cake',
    'Ванильный торт с розой',
    'Роза барлы ванильді торт',
    'Delicate vanilla sponge infused with rose water and fresh petals.',
    'Нежный ванильный бисквит с розовой водой и свежими лепестками.',
    'Роза сумен нәзік ванильді бисквит және жаңа гül жапырақтары.',
    9200.00,
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
    2
  ),
  (
    'french-eclairs-box',
    (SELECT id FROM categories WHERE slug = 'pastries'),
    'French Eclairs (6 pcs)',
    'Французские эклеры (6 шт)',
    'Француз эклерлері (6 дана)',
    'Classic choux pastry filled with vanilla cream and dark chocolate glaze.',
    'Классическое заварное тесто с ванильным кремом и шоколадной глазурью.',
    'Ваниль кремі мен қара шоколад глазурі бар классикалық заварное тесто.',
    4200.00,
    'https://images.unsplash.com/photo-1612203985729-707241561931?w=800&q=80',
    1
  ),
  (
    'pistachio-macarons',
    (SELECT id FROM categories WHERE slug = 'desserts'),
    'Pistachio Macarons (8 pcs)',
    'Фисташковые макарон (8 шт)',
    'Фисташка макарон (8 дана)',
    'Handcrafted almond macarons with premium pistachio filling.',
    'Ручные миндальные макарон с начинкой из отборного фисташкового крема.',
    'Таңдаулы фисташка кремі бар қолмен жасалған миндаль макарон.',
    5800.00,
    'https://images.unsplash.com/photo-1569864358642-9d1684040f0e?w=800&q=80',
    1
  )
ON CONFLICT (slug) DO NOTHING;
