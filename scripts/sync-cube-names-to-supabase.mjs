#!/usr/bin/env node
/**
 * Küp ürün Latin isimlerini Supabase products tablosuna yazar.
 * Çalıştır: node scripts/sync-cube-names-to-supabase.mjs
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

const CUBE_NAMES = {
  'pack-tiramisu': 'Tiramisu Cube',
  'pack-strawberry-cake': 'Strawberry Cube',
  'pack-crunch': 'Crunch Cube',
  'pack-lotus': 'Lotus Cube',
  'pack-cherry-brownie': 'Cherry Cube',
  'pack-pistachio-raspberry': 'Pistachio Cube',
  'pack-oreo': 'Oreo Cube',
  'pack-meringue-cake': 'Merenga Cube',
};

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key || url.includes('your-project')) {
  console.error('Supabase URL veya SERVICE_ROLE_KEY eksik.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let updated = 0;
const errors = [];

for (const [slug, name] of Object.entries(CUBE_NAMES)) {
  const { data, error } = await supabase
    .from('products')
    .update({
      name_en: name,
      name_ru: name,
      name_kk: name,
      name_tr: name,
    })
    .eq('slug', slug)
    .select('slug, name_en');

  if (error) {
    errors.push(`${slug}: ${error.message}`);
    continue;
  }
  if (!data?.length) {
    errors.push(`${slug}: Supabase'te bulunamadı`);
    continue;
  }
  updated++;
  console.log(`✅ ${slug} → ${name}`);
}

console.log(`\n${updated}/${Object.keys(CUBE_NAMES).length} küp ürün güncellendi`);
if (errors.length) {
  console.error('Hatalar:\n' + errors.join('\n'));
  process.exit(1);
}
