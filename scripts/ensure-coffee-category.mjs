#!/usr/bin/env node
/**
 * Kahve kategorisini Supabase'de oluşturur (yoksa).
 * Çalıştır: node scripts/ensure-coffee-category.mjs
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

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key || url.includes('your-project')) {
  console.error('Supabase URL veya SERVICE_ROLE_KEY eksik.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: existing } = await supabase
  .from('categories')
  .select('id, slug')
  .eq('slug', 'coffee')
  .maybeSingle();

if (existing) {
  console.log('✅ Kahve kategorisi zaten var:', existing.id);
  process.exit(0);
}

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
    show_on_home: true,
    image_url: '',
  })
  .select('id, slug')
  .single();

if (error) {
  console.error('Oluşturma hatası:', error.message);
  process.exit(1);
}

console.log('✅ Kahve kategorisi oluşturuldu:', data.id);
