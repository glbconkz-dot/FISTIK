#!/usr/bin/env node
/**
 * B2B fiyatlarını b2b_product_prices tablosuna yazar (B2C price değişmez).
 * node scripts/sync-b2b-prices-to-supabase.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env.local');
const pricesPath = join(root, 'src/data/b2b-prices.ts');

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

function loadB2BPrices() {
  const content = readFileSync(pricesPath, 'utf8');
  const prices = {};
  const re = /'([^']+)':\s*(\d+)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    prices[m[1]] = Number(m[2]);
  }
  return prices;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Supabase URL veya SERVICE_ROLE_KEY eksik.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const b2bPrices = loadB2BPrices();

const { data: products, error: prodErr } = await supabase
  .from('products')
  .select('id, slug')
  .in('slug', Object.keys(b2bPrices));

if (prodErr) {
  console.error(prodErr.message);
  process.exit(1);
}

const slugToId = new Map((products ?? []).map((p) => [p.slug, p.id]));
const rows = [];
const missing = [];

for (const [slug, price] of Object.entries(b2bPrices)) {
  const id = slugToId.get(slug);
  if (!id) {
    missing.push(slug);
    continue;
  }
  rows.push({ product_id: id, price });
}

if (missing.length) {
  console.warn('⚠ Supabase\'te bulunamayan slug:', missing.join(', '));
}

const { error } = await supabase.from('b2b_product_prices').upsert(rows, {
  onConflict: 'product_id',
});

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`✅ ${rows.length} B2B fiyatı güncellendi (B2C fiyatlarına dokunulmadı)`);
