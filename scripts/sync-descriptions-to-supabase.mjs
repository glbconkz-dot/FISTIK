#!/usr/bin/env node
/**
 * product-assets.json açıklamalarını Supabase'e yazar.
 * Çalıştır: node scripts/sync-descriptions-to-supabase.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  const raw = readFileSync(join(root, '.env.local'), 'utf8');
  const vars = {};
  for (const line of raw.split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    vars[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return vars;
}

const assets = JSON.parse(readFileSync(join(root, 'src/data/product-assets.json'), 'utf8'));
const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

let updated = 0;

for (const asset of assets) {
  if (!asset.slugs?.length) continue;
  const hasDesc = ['description_en', 'description_ru', 'description_kk', 'description_tr'].some(
    (k) => asset[k]
  );
  if (!hasDesc) continue;

  const patch = {};
  for (const k of ['description_en', 'description_ru', 'description_kk', 'description_tr']) {
    if (asset[k]) patch[k] = asset[k];
  }

  for (const slug of asset.slugs) {
    const { data, error } = await supabase.from('products').update(patch).eq('slug', slug).select('slug');
    if (error) {
      console.error(`${slug}: ${error.message}`);
      continue;
    }
    if (data?.length) updated++;
  }
}

console.log(`✅ ${updated} ürün açıklaması güncellendi`);
