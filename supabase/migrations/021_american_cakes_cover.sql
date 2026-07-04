-- Box Dikdörtgen Pastalar: kategori kapağı → Ferrero Fındıklı Mus

UPDATE categories SET image_url = '/products/american-cakes/ferrero-hazelnut.png'
WHERE slug = 'american-cakes';

-- Tiramisu Elite box: küp tiramisu görselini kaldır (yanlış eşleşme)
UPDATE products SET image_url = '/product-placeholder.jpg'
WHERE slug = 'american-tiramisu'
  AND image_url = '/products/packaged-desserts/tiramisu.png';
