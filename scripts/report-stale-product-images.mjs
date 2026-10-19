/**
 * Rapor: DB görselleri vs product-assets fallback (silinen ama canlıda duran).
 * node scripts/report-stale-product-images.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const assets = JSON.parse(readFileSync(join(root, 'src/data/product-assets.json'), 'utf8'));
const assetBySlug = new Map();
for (const a of assets) {
  for (const s of a.slugs ?? []) assetBySlug.set(s, a);
}

const PRIORITY = [
  'eclair-large-pineapple',
  'eclair-large-cherry',
  'eclair-mini-pineapple',
  'eclair-mini-cherry',
  'eclair-mini-pistachio',
  'eclair-mini-vanilla',
  'eclair-mini-mastic',
  'eclair-mini-hazelnut',
  'eclair-mini-raspberry',
  'eclair-mini-strawberry',
  'frozen-borek-meat',
  'frozen-borek-chicken',
  'frozen-borek-potato',
  'frozen-borek-brinza',
  'frozen-borek-spinach',
  'frozen-borek-lentils',
  'mini-borek-meat',
  'mini-borek-chicken',
  'mini-borek-potato',
  'mini-borek-spinach',
  'mini-borek-brinza',
  'mini-borek-lentils',
  'sarma-borek-meat',
  'sarma-borek-chicken',
  'sarma-borek-brinza',
  'sarma-borek-spinach',
  'sarma-borek-potato',
  'sarma-borek-lentils',
];

function isPlaceholder(url) {
  const v = (url || '').trim();
  return !v || v.includes('product-placeholder');
}
function isRemote(url) {
  const v = (url || '').trim();
  return /^https?:\/\//i.test(v) || v.includes('/storage/v1/');
}
function assetGallery(a) {
  if (!a) return [];
  return [a.image_url, ...(a.image_urls || [])].filter(Boolean);
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await sb
  .from('products')
  .select('slug,name_tr,name_en,image_url,image_urls,created_at,category_id')
  .in('slug', PRIORITY)
  .order('slug');

if (error) {
  console.error(error);
  process.exit(1);
}

const lines = [];
const log = (s) => {
  lines.push(s);
  console.log(s);
};

log('=== ÖNCELİK RAPORU: Admin silinen / DB boş ama canlıda static fallback ===');
log('');

const deletedButLive = [];
const adminTodayRemote = [];
const both = [];

for (const p of data ?? []) {
  const asset = assetBySlug.get(p.slug);
  const ag = assetGallery(asset);
  const dbPrimary = (p.image_url || '').trim();
  const dbExtras = (p.image_urls || []).filter(Boolean);
  const placeholder = isPlaceholder(dbPrimary);
  const livePrimary = placeholder ? ag[0] || '' : dbPrimary;
  const liveExtras =
    placeholder
      ? [...new Set([...dbExtras.filter((u) => u !== ag[0]), ...ag.slice(1)])]
      : [...new Set([...dbExtras, ...ag.filter((u) => u !== dbPrimary)])];

  const staleFromAsset =
    placeholder && ag.length > 0
      ? true
      : !placeholder && ag.some((u) => !dbExtras.includes(u) && u !== dbPrimary);

  const row = {
    slug: p.slug,
    name: p.name_tr || p.name_en,
    dbPrimary: dbPrimary || '(empty)',
    dbExtras,
    livePrimary,
    liveExtras,
    assetPaths: ag,
    staleFromAsset,
    created_at: p.created_at,
  };

  if (placeholder && ag.length) deletedButLive.push(row);
  if (isRemote(dbPrimary) || dbExtras.some(isRemote)) adminTodayRemote.push(row);
  if (staleFromAsset) both.push(row);
}

log('--- A) DB boş/placeholder → canlıda STATIC gösterilir (admin silmiş sayılır) ---');
if (!deletedButLive.length) log('(yok)');
for (const r of deletedButLive) {
  log(`  ${r.slug} | ${r.name}`);
  log(`    DB: ${r.dbPrimary}`);
  log(`    CANLI (asset): ${r.livePrimary}`);
  if (r.liveExtras.length) log(`    CANLI ekstra: ${r.liveExtras.join(', ')}`);
}

log('');
log('--- B) DB’de admin/remote URL var (yeni yükleme / halihazırda Storage) ---');
if (!adminTodayRemote.length) log('(öncelikli listede remote yok)');
for (const r of adminTodayRemote) {
  log(`  ${r.slug} | ${r.name}`);
  log(`    primary: ${r.dbPrimary}`);
  if (r.dbExtras.length) log(`    extras: ${r.dbExtras.join(', ')}`);
  const leaked = (r.assetPaths || []).filter(
    (u) => u !== r.dbPrimary && !(r.dbExtras || []).includes(u)
  );
  if (leaked.length) {
    log(`    ⚠ galeriye asset sızıntısı (admin silinse bile canlıya eklenir): ${leaked.join(', ')}`);
  }
}

log('');
log('--- C) NEDEN ---');
log('Admin panel ürün kaydında resmi silince Supabase image_url boş/placeholder olur.');
log('Canlı katalog applyProductAssets() ile product-assets.json + public/ dosyasını geri koyar.');
log('Ayrıca ana resim Storage olsa bile, silinen galeri görselleri asset’ten image_urls’e eklenir.');

writeFileSync(join(root, 'scripts/.stale-image-report.txt'), lines.join('\n'), 'utf8');
