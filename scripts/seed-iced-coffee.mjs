#!/usr/bin/env node
/**
 * Soğuk Kahveler ürünlerini Supabase'e ekler/günceller.
 * Çalıştır: node scripts/seed-iced-coffee.mjs
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
    slug: 'iced-americano',
    name_en: 'Iced Americano',
    name_tr: 'Iced Americano',
    price: 1490,
    image_url: '/products/iced-coffee/iced-americano.png',
    sort_order: 1,
    description_en: 'Iced americano with ice.',
    description_ru: 'Холодный американо со льдом.',
    description_kk: 'Мұзды iced americano.',
    description_tr: 'Buzlu americano.',
  },
  {
    slug: 'iced-latte',
    name_en: 'Iced Latte',
    name_tr: 'Iced Latte',
    price: 1690,
    image_url: '/products/iced-coffee/iced-latte.png',
    sort_order: 2,
    description_en: 'Iced latte with milk and ice.',
    description_ru: 'Холодный латте с молоком и льдом.',
    description_kk: 'Сүт пен мұзды iced latte.',
    description_tr: 'Süt ve buzlu iced latte.',
  },
  {
    slug: 'iced-spanish-latte',
    name_en: 'Iced Spanish Latte',
    name_tr: 'Iced Spanish Latte',
    price: 1690,
    image_url: '/products/iced-coffee/iced-spanish-latte.png',
    sort_order: 3,
    description_en: 'Espresso, condensed milk, milk, ice, cinnamon.',
    description_ru: 'Эспрессо, сгущёнка, молоко, лёд, корица.',
    description_kk: 'Эспрессо, қоюланған сүт, сүт, мұз, даршын.',
    description_tr: 'Espresso, kondanse süt, süt, buz, tarçın.',
  },
  {
    slug: 'iced-caramel-latte',
    name_en: 'Iced Caramel Latte',
    name_tr: 'Iced Caramel Latte',
    price: 1690,
    image_url: '/products/iced-coffee/iced-caramel-latte.png',
    sort_order: 4,
    description_en: 'Iced latte with caramel drizzle.',
    description_ru: 'Холодный латте с карамелью.',
    description_kk: 'Карамельді iced latte.',
    description_tr: 'Karamelli iced latte.',
  },
  {
    slug: 'iced-mocha',
    name_en: 'Iced Mocha',
    name_tr: 'Iced Mocha',
    price: 1690,
    image_url: '/products/iced-coffee/iced-mocha.png',
    sort_order: 5,
    description_en: 'Iced mocha with chocolate.',
    description_ru: 'Холодный мокко с шоколадом.',
    description_kk: 'Шоколадты iced mocha.',
    description_tr: 'Çikolatalı iced mocha.',
  },
  {
    slug: 'iced-vanilla-latte',
    name_en: 'Iced Vanilla Latte',
    name_tr: 'Iced Vanilla Latte',
    price: 1690,
    image_url: '/products/iced-coffee/iced-vanilla-latte.png',
    sort_order: 6,
    description_en: 'Iced latte with vanilla syrup.',
    description_ru: 'Холодный латте с ванилью.',
    description_kk: 'Ванильді iced latte.',
    description_tr: 'Vanilyalı iced latte.',
  },
  {
    slug: 'cold-brew-latte',
    name_en: 'Cold Brew Latte',
    name_tr: 'Cold Brew Latte',
    price: 1690,
    image_url: '/products/iced-coffee/cold-brew-latte.png',
    sort_order: 7,
    description_en: 'Cold brew with milk and ice.',
    description_ru: 'Колд брю с молоком и льдом.',
    description_kk: 'Сүт пен мұзды cold brew latte.',
    description_tr: 'Süt ve buzlu cold brew latte.',
  },
  {
    slug: 'cold-brew',
    name_en: 'Cold Brew',
    name_tr: 'Cold Brew',
    price: 1490,
    image_url: '/products/iced-coffee/cold-brew.png',
    sort_order: 8,
    description_en: 'Slow steeped cold brew coffee.',
    description_ru: 'Медленной экстракции колд брю.',
    description_kk: 'Баяу тұндырылған cold brew.',
    description_tr: 'Yavaş demlenmiş cold brew.',
  },
  {
    slug: 'espresso-tonic',
    name_en: 'Espresso Tonic',
    name_tr: 'Espresso Tonic',
    price: 1690,
    image_url: '/products/iced-coffee/espresso-tonic.png',
    sort_order: 9,
    description_en: 'Espresso, tonic water, ice.',
    description_ru: 'Эспрессо, тоник, лёд.',
    description_kk: 'Эспрессо, тоник, мұз.',
    description_tr: 'Espresso, tonik, buz.',
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
  .eq('slug', 'iced-coffee')
  .maybeSingle();

if (!cat) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      slug: 'iced-coffee',
      name_en: 'Iced Coffee',
      name_ru: 'Холодный кофе',
      name_kk: 'Суық кофе',
      name_tr: 'Soğuk Kahveler',
      sort_order: 18,
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
  console.log('✅ Soğuk Kahveler kategorisi oluşturuldu:', cat.id);
} else {
  console.log('✅ Soğuk Kahveler kategorisi:', cat.id);
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

console.log(`\n✅ Soğuk Kahveler (${PRODUCTS.length}) hazır.`);
