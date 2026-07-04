-- Semi-finished product images

UPDATE products SET image_url = '/products/semi-finished/borek-pack-6.png'
WHERE slug LIKE 'frozen-borek-%';

UPDATE products SET image_url = '/products/semi-finished/sarma-borek.png'
WHERE slug LIKE 'sarma-borek-%';

UPDATE products SET image_url = '/products/semi-finished/waffle.png'
WHERE slug = 'semi-waffle';
