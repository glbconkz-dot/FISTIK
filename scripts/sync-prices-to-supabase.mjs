#!/usr/bin/env node
/**
 * menu.ts fiyatlarını Supabase products tablosuna yazar.
 * Çalıştır: node scripts/sync-prices-to-supabase.mjs
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

function parseMenuPrices() {
  const content = readFileSync(join(root, 'src/data/menu.ts'), 'utf8');
  const re =
    /product\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+)(?:,\s*(?:'([^']*)'|undefined))?(?:,\s*(\d+))?\s*\)/g;
  const prices = [];
  let match;
  while ((match = re.exec(content)) !== null) {
    prices.push({ slug: match[1], price: match[8] ? Number(match[8]) : 1500 });
  }
  return prices;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key || url.includes('your-project')) {
  console.error('Supabase URL veya SERVICE_ROLE_KEY eksik.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const prices = parseMenuPrices();

let updated = 0;
let missing = 0;
const errors = [];

for (const { slug, price } of prices) {
  const { data, error } = await supabase
    .from('products')
    .update({ price })
    .eq('slug', slug)
    .select('slug');

  if (error) {
    errors.push(`${slug}: ${error.message}`);
    continue;
  }
  if (!data?.length) {
    missing++;
    console.warn(`⚠ slug yok: ${slug}`);
    continue;
  }
  updated++;
}

console.log(`\n✅ ${updated} ürün güncellendi`);
if (missing) console.log(`⚠ ${missing} slug Supabase'te bulunamadı`);
if (errors.length) {
  console.error('Hatalar:', errors.join('\n'));
  process.exit(1);
}
