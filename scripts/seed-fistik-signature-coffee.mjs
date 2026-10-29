#!/usr/bin/env node
/**
 * Fıstık Signature kahve ürünlerini Supabase'e ekler/günceller.
 * Çalıştır: node scripts/seed-fistik-signature-coffee.mjs
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
    slug: 'coffee-fistik-latte',
    name: 'Fıstık Latte',
    image_url: '/products/coffee/fistik-latte.png',
    sort_order: 1,
    description_en: 'Fıstık Signature — pistachio cream latte.',
    description_ru: 'Fıstık Signature — фисташковый крем-латте.',
    description_kk: 'Fıstık Signature — пісте крем-латте.',
    description_tr: 'Fıstık Signature — fıstık kremalı latte.',
  },
  {
    slug: 'coffee-salted-caramel-latte',
    name: 'Salted Caramel Latte',
    image_url: '/products/coffee/salted-caramel-latte.png',
    sort_order: 2,
    description_en: 'Fıstık Signature — salted caramel latte.',
    description_ru: 'Fıstık Signature — солёная карамель латте.',
    description_kk: 'Fıstık Signature — тұзды карамель латте.',
    description_tr: 'Fıstık Signature — tuzlu karamel latte.',
  },
  {
    slug: 'coffee-lotus-latte',
    name: 'Lotus Latte',
    image_url: '/products/coffee/lotus-latte.png',
    sort_order: 3,
    description_en: 'Fıstık Signature — Lotus biscuit latte.',
    description_ru: 'Fıstık Signature — латте с печеньем Lotus.',
    description_kk: 'Fıstık Signature — Lotus печеньелі латте.',
    description_tr: 'Fıstık Signature — Lotus bisküvili latte.',
  },
  {
    slug: 'coffee-spanish-latte',
    name: 'Spanish Latte',
    image_url: '/products/coffee/spanish-latte.png',
    sort_order: 4,
    description_en: 'Fıstık Signature — Spanish latte with caramelized top.',
    description_ru: 'Fıstık Signature — испанский латте с карамельной корочкой.',
    description_kk: 'Fıstık Signature — карамель қабыршақты Spanish латте.',
    description_tr: 'Fıstık Signature — karamelize üstlü Spanish latte.',
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

let { data: coffeeCat } = await supabase
  .from('categories')
  .select('id, slug')
  .eq('slug', 'coffee')
  .maybeSingle();

if (!coffeeCat) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      slug: 'coffee',
      name_en: 'Coffee',
      name_ru: 'Кофе',
      name_kk: 'Кофе',
      name_tr: 'Kahve',
      sort_order: 16,
      is_active: true,
      show_on_home: false,
      image_url: '',
    })
    .select('id, slug')
    .single();
  if (error) {
    console.error('Kahve kategorisi oluşturulamadı:', error.message);
    process.exit(1);
  }
  coffeeCat = data;
  console.log('✅ Kahve kategorisi oluşturuldu:', coffeeCat.id);
} else {
  console.log('✅ Kahve kategorisi:', coffeeCat.id);
}

for (const p of PRODUCTS) {
  const row = {
    slug: p.slug,
    category_id: coffeeCat.id,
    name_en: p.name,
    name_ru: p.name,
    name_kk: p.name,
    name_tr: p.name,
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

console.log(`\n✅ Fıstık Signature (${PRODUCTS.length}) hazır — fiyat ${PRICE} ₸, stok ${STOCK}.`);
