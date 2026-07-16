#!/usr/bin/env node
/**
 * Çikolata Serisi ürünlerini Supabase'e ekler/günceller.
 * Çalıştır: node scripts/seed-chocolate-series.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env.local');

function loadEnv() {
  if (!existsSync(envPath)) throw new Error('.env.local bulunamadı');
  const vars = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    vars[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return vars;
}

const PRODUCTS = [
  {
    slug: 'chocolate-pistachio-hot',
    name_en: 'Pistachio Hot Chocolate',
    name_tr: 'Fıstıklı Sıcak Çikolata',
    image_url: '/products/chocolate/pistachio-hot-chocolate.png',
    sort_order: 1,
    description_en: 'Çikolata Serisi — pistachio hot chocolate.',
    description_ru: 'Шоколадная серия — фисташковый горячий шоколад.',
    description_kk: 'Шоколад сериясы — пістелі ыстық шоколад.',
    description_tr: 'Çikolata Serisi — fıstıklı sıcak çikolata.',
  },
  {
    slug: 'chocolate-white-hot',
    name_en: 'White Hot Chocolate',
    name_tr: 'Beyaz Sıcak Çikolata',
    image_url: '/products/chocolate/white-hot-chocolate.png',
    sort_order: 2,
    description_en: 'Çikolata Serisi — white hot chocolate.',
    description_ru: 'Шоколадная серия — белый горячий шоколад.',
    description_kk: 'Шоколад сериясы — ақ ыстық шоколад.',
    description_tr: 'Çikolata Serisi — beyaz sıcak çikolata.',
  },
  {
    slug: 'chocolate-hot',
    name_en: 'Hot Chocolate',
    name_tr: 'Sıcak Çikolata',
    image_url: '/products/chocolate/hot-chocolate.png',
    sort_order: 3,
    description_en: 'Çikolata Serisi — classic hot chocolate.',
    description_ru: 'Шоколадная серия — классический горячий шоколад.',
    description_kk: 'Шоколад сериясы — классикалық ыстық шоколад.',
    description_tr: 'Çikolata Serisi — klasik sıcak çikolata.',
  },
];

const PRICE = 1890;
const STOCK = 8;

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key || url.includes('your-project')) {
  console.error('Supabase URL veya SERVICE_ROLE_KEY eksik.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let { data: cat } = await supabase
  .from('categories')
  .select('id, slug')
  .eq('slug', 'chocolate-series')
  .maybeSingle();

if (!cat) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      slug: 'chocolate-series',
      name_en: 'Chocolate Series',
      name_ru: 'Шоколадная серия',
      name_kk: 'Шоколад сериясы',
      name_tr: 'Çikolata Serisi',
      sort_order: 17,
      is_active: true,
      show_on_home: false,
      image_url: '',
    })
    .select('id, slug')
    .single();
  if (error) {
    console.error('Kategori oluşturulamadı:', error.message);
    process.exit(1);
  }
  cat = data;
  console.log('✅ Çikolata Serisi kategorisi oluşturuldu:', cat.id);
} else {
  console.log('✅ Çikolata Serisi kategorisi:', cat.id);
}

for (const p of PRODUCTS) {
  const row = {
    slug: p.slug,
    category_id: cat.id,
    name_en: p.name_en,
    name_ru: p.name_en,
    name_kk: p.name_en,
    name_tr: p.name_tr,
    description_en: p.description_en,
    description_ru: p.description_ru,
    description_kk: p.description_kk,
    description_tr: p.description_tr,
    price: PRICE,
    image_url: p.image_url,
    is_active: true,
    stock_quantity: STOCK,
    sort_order: p.sort_order,
  };

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', p.slug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('products').update(row).eq('id', existing.id);
    if (error) {
      console.error(`❌ ${p.slug}:`, error.message);
      process.exit(1);
    }
    console.log(`🔄 Güncellendi: ${p.slug}`);
  } else {
    const { error } = await supabase.from('products').insert(row);
    if (error) {
      console.error(`❌ ${p.slug}:`, error.message);
      process.exit(1);
    }
    console.log(`✨ Eklendi: ${p.slug}`);
  }
}

console.log(`\n✅ Çikolata Serisi (${PRODUCTS.length}) hazır — fiyat ${PRICE} ₸, stok ${STOCK}.`);
