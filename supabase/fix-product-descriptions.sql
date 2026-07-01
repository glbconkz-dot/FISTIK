-- Eski urun aciklamalarindaki Kaskelen metnini kaldir
-- Supabase SQL Editor → Run

UPDATE products SET
  description_tr = 'Siparişiniz üzerine, FISTIK atölyesinde özenle hazırlanır.',
  description_ru = 'Готовим на заказ с душой в ателье FISTIK.',
  description_kk = 'FISTIK ательесінде тапсырыс бойынша махаббатпен дайындалады.',
  description_en = 'Made to order with care at the FISTIK atelier.'
WHERE description_tr ILIKE '%kaskelen%'
   OR description_ru ILIKE '%каскелен%'
   OR description_kk ILIKE '%каскелен%'
   OR description_en ILIKE '%kaskelen%';
