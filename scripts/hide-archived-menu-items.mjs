#!/usr/bin/env node
/**
 * Arşivlenen menü ürünlerini Supabase'de is_active=false yapar (silmez).
 * node scripts/hide-archived-menu-items.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SLUGS = [
  'pack-crunch',
  'pack-oreo',
  'art-hamburger',
  'tart-dark-chocolate',
  'eclair-mini-pistachio',
  'eclair-mini-hazelnut',
  'eclair-mini-vanilla',
  'eclair-mini-mastic',
  'eclair-mini-strawberry',
  'eclair-mini-raspberry',
  'eclair-mini-cherry',
  'eclair-mini-pineapple',
];

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env.local');

function loadEnv() {
  const vars = {};
  if (!existsSync(envPath)) return vars;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    vars[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return vars;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('SKIP: .env.local içinde NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY yok.');
  console.error('SQL: supabase/migrations/027_archive_storefront_items.sql');
  process.exit(2);
}

const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await supabase
  .from('products')
  .update({ is_active: false })
  .in('slug', SLUGS)
  .select('slug, name_tr, name_en, is_active');

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log('archived', (data ?? []).length);
for (const row of data ?? []) {
  console.log(`  ${row.slug}\t${row.name_tr || row.name_en}\tinactive`);
}
