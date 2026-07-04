-- Waffle: pack of 5 descriptions

UPDATE products SET
  description_en = 'Pack of 5 · ready to bake.',
  description_ru = 'Упаковка 5 шт. · готов к выпечке.',
  description_kk = '5 даналық орама · пісіруге дайын.',
  description_tr = '5''li paket · pişirmeye hazır.'
WHERE slug = 'semi-waffle';
