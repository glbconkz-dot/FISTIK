#!/usr/bin/env node
/**
 * Normal Kahve ürünlerini Supabase'e ekler/günceller.
 * Çalıştır: node scripts/seed-classic-coffee.mjs
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
    slug: 'classic-espresso',
    name_en: 'Espresso',
    name_tr: 'Espresso',
    price: 990,
    image_url: '/products/classic-coffee/espresso.png',
    sort_order: 1,
    description_en: 'Classic espresso shot.',
    description_ru: 'Классический эспрессо.',
    description_kk: 'Классикалық эспрессо.',
    description_tr: 'Klasik espresso.',
  },
  {
    slug: 'classic-americano',
    name_en: 'Americano',
    name_tr: 'Americano',
    price: 1290,
    image_url: '/products/classic-coffee/americano.png',
    sort_order: 2,
    description_en: 'Espresso with hot water.',
    description_ru: 'Эспрессо с горячей водой.',
    description_kk: 'Ыстық сумен эспрессо.',
    description_tr: 'Sıcak su ile espresso.',
  },
  {
    slug: 'classic-cappuccino',
    name_en: 'Cappuccino',
    name_tr: 'Cappuccino',
    price: 1590,
    image_url: '/products/classic-coffee/cappuccino.png',
    sort_order: 3,
    description_en: 'Espresso, steamed milk and foam.',
    description_ru: 'Эспрессо, молоко и пенка.',
    description_kk: 'Эспрессо, сүт және көбік.',
    description_tr: 'Espresso, süt ve köpük.',
  },
  {
    slug: 'classic-flat-white',
    name_en: 'Flat White',
    name_tr: 'Flat White',
    price: 1590,
    image_url: '/products/classic-coffee/flat-white.png',
    sort_order: 4,
    description_en: 'Espresso with silky microfoam.',
    description_ru: 'Эспрессо с бархатистой микропенкой.',
    description_kk: 'Жібектей микрокөбікті эспрессо.',
    description_tr: 'İpeksi microfoam ile espresso.',
  },
  {
    slug: 'classic-turkish-coffee',
    name_en: 'Turkish Coffee',
    name_tr: 'Türk Kahvesi',
    price: 990,
    image_url: '/products/classic-coffee/turkish-coffee.png',
    sort_order: 5,
    description_en: 'Traditional Turkish coffee.',
    description_ru: 'Традиционный турецкий кофе.',
    description_kk: 'Дәстүрлі түрік кофесі.',
    description_tr: 'Geleneksel Türk kahvesi.',
  },
];

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
  .eq('slug', 'classic-coffee')
  .maybeSingle();

if (!cat) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      slug: 'classic-coffee',
      name_en: 'Coffee',
      name_ru: 'Кофе',
      name_kk: 'Кофе',
      name_tr: 'Kahve',
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
  console.log('✅ Kahve kategorisi oluşturuldu:', cat.id);
} else {
  console.log('✅ Kahve kategorisi:', cat.id);
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
    price: p.price,
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
    console.log(`🔄 Güncellendi: ${p.slug} (${p.price} ₸)`);
  } else {
    const { error } = await supabase.from('products').insert(row);
    if (error) {
      console.error(`❌ ${p.slug}:`, error.message);
      process.exit(1);
    }
    console.log(`✨ Eklendi: ${p.slug} (${p.price} ₸)`);
  }
}

console.log(`\n✅ Normal Kahve (${PRODUCTS.length}) hazır.`);
