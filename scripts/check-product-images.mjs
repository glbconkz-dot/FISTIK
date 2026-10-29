import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = [];
const log = (s) => {
  out.push(s);
  console.log(s);
};

const assets = JSON.parse(readFileSync(join(root, 'src/data/product-assets.json'), 'utf8'));
let assetGaps = 0;
for (const a of assets) {
  for (const url of [a.image_url, ...(a.image_urls || [])].filter(Boolean)) {
    if (!String(url).startsWith('/')) continue;
    if (!existsSync(join(root, 'public', url.slice(1)))) {
      assetGaps++;
      log(`ASSET_GAP\t${(a.slugs || []).join(',')}\t${url}`);
    }
  }
}
log(`ASSET_GAPS_TOTAL\t${assetGaps}`);

const env = Object.fromEntries(
  readFileSync(join(root, '.env.local'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { data, error } = await sb
  .from('products')
  .select('slug,name_tr,name_en,image_url,is_active')
  .order('sort_order');
if (error) {
  log(`DB_ERROR\t${error.message}`);
  writeFileSync(join(root, 'scripts/.image-check-out.txt'), out.join('\n'));
  process.exit(1);
}

const noImage = [];
const remote = [];
const localMissing = [];
const localOk = [];
for (const p of data) {
  const url = (p.image_url || '').trim();
  if (!url || url.includes('placeholder')) {
    noImage.push(p);
    continue;
  }
  if (/^https?:\/\//i.test(url) || url.includes('/storage/v1/')) {
    remote.push(p);
    continue;
  }
  if (url.startsWith('/')) {
    if (existsSync(join(root, 'public', url.slice(1)))) localOk.push(p);
    else localMissing.push(p);
  }
}

log(`DB_TOTAL\t${data.length}`);
log(`DB_NO_IMAGE\t${noImage.length}`);
for (const p of noImage) log(`  NOIMG\t${p.slug}\t${p.name_tr || p.name_en}\t${p.image_url || ''}`);
log(`DB_REMOTE\t${remote.length}`);
for (const p of remote.slice(0, 20)) log(`  REMOTE\t${p.slug}\t${p.image_url}`);
if (remote.length > 20) log(`  REMOTE_MORE\t${remote.length - 20}`);
log(`DB_LOCAL_MISSING\t${localMissing.length}`);
for (const p of localMissing) log(`  LOCMISS\t${p.slug}\t${p.image_url}`);
log(`DB_LOCAL_OK\t${localOk.length}`);

writeFileSync(join(root, 'scripts/.image-check-out.txt'), out.join('\n'));
