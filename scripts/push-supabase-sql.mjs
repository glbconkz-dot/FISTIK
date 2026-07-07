#!/usr/bin/env node
/**
 * Supabase SQL'i service role ile çalıştırır (küp isimleri + B2B).
 * node scripts/push-supabase-sql.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env.local');

function loadEnv() {
  const vars = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    vars[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return vars;
}

const CUBE = {
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
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

for (const [slug, name] of Object.entries(CUBE)) {
  const { error } = await supabase
    .from('products')
    .update({ name_en: name, name_ru: name, name_kk: name, name_tr: name })
    .eq('slug', slug);
  if (error) {
    console.error(`❌ ${slug}: ${error.message}`);
    process.exit(1);
  }
  console.log(`✅ ${slug}`);
}

const { error: b2bCheck } = await supabase.from('b2b_customers').select('id').limit(1);
if (b2bCheck?.code === '42P01') {
  console.log('\n⚠ B2B tabloları yok — deploy/SUPABASE-TEK-YAPISTIR.sql dosyasını Supabase SQL Editor\'a yapıştırın.');
} else if (b2bCheck) {
  console.error('B2B kontrol:', b2bCheck.message);
} else {
  console.log('✅ B2B tabloları mevcut');
}

console.log('\nKüp isimleri Supabase\'e yazıldı.');
