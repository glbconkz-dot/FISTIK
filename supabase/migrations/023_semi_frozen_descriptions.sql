-- Yarı mamul: börekler pişirmeye hazır + −18 özel dondurma; waffle pişmiş

UPDATE products SET
  description_tr = '6''lı paket · Pişirmeye hazır, −18 °C''de özel olarak dondurulmuş.'
WHERE slug LIKE 'frozen-borek-%';

UPDATE products SET
  description_tr = '16''lı paket · Pişirmeye hazır, −18 °C''de özel olarak dondurulmuş.'
WHERE slug LIKE 'mini-borek-%';

UPDATE products SET
  description_tr = 'Sarma börek · Pişirmeye hazır, −18 °C''de özel olarak dondurulmuş.'
WHERE slug LIKE 'sarma-borek-%';

UPDATE products SET
  description_tr = '5''li paket · Pişmiş ürün, −18 °C''de özel olarak dondurulmuş.'
WHERE slug = 'semi-waffle';
