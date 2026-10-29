#!/usr/bin/env node
/**
 * Tüm ürün stoklarını 8 yapar (geçici başlangıç).
 * Çalıştır: node scripts/set-all-stock-to-8.mjs
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

const STOCK = 8;
const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key || url.includes('your-project')) {
  console.error('Supabase URL veya SERVICE_ROLE_KEY eksik.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await supabase
  .from('products')
  .update({ stock_quantity: STOCK })
  .neq('id', '00000000-0000-0000-0000-000000000000')
  .select('id, slug, stock_quantity');

if (error) {
  console.error('Güncelleme hatası:', error.message);
  process.exit(1);
}

console.log(`✅ ${data?.length ?? 0} ürün stoku ${STOCK} olarak ayarlandı.`);
for (const row of data ?? []) {
  console.log(`  - ${row.slug}: ${row.stock_quantity}`);
}
