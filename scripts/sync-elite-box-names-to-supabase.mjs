#!/usr/bin/env node
/**
 * Dikdörtgen box pasta Latin isimlerini Supabase products tablosuna yazar.
 * Çalıştır: node scripts/sync-elite-box-names-to-supabase.mjs
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

const ELITE_BOX_NAMES = {
  'american-tiramisu': 'Tiramisu Elite box',
  'american-strawberry-cake': 'Strawberry Elite box',
  'american-lotus': 'Lotus Elite box',
  'american-cherry-brownie': 'Cherry Elite box',
  'american-pistachio-raspberry': 'Pistachio Elite box',
  'mango-coconut-mousse': 'Mango Musse Elite box',
  'ferrero-hazelnut-mousse': 'Ferrero Musse Elite box',
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

for (const [slug, name] of Object.entries(ELITE_BOX_NAMES)) {
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

console.log(`\n${updated}/${Object.keys(ELITE_BOX_NAMES).length} box pasta güncellendi`);
if (errors.length) {
  console.error('Hatalar:\n' + errors.join('\n'));
  process.exit(1);
}
