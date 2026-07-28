import { existsSync, readFileSync } from 'node:fs';
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

const updates = [
  {
    slug: 'cake-snickers',
    image_url: '/products/classic-cakes/snickers-cake.jpg',
    image_urls: [
      '/products/classic-cakes/snickers-cake-slice.jpg',
      '/products/classic-cakes/snickers-cake-top.jpg',
    ],
  },
  {
    slug: 'cake-chocolate',
    image_url: '/products/classic-cakes/chocolate-cake.jpg',
    image_urls: [
      '/products/classic-cakes/chocolate-cake-slice.jpg',
      '/products/classic-cakes/chocolate-cake-top.jpg',
    ],
  },
  {
    slug: 'cake-milk-girl',
    image_url: '/products/classic-cakes/milk-girl.jpg',
    image_urls: [
      '/products/classic-cakes/milk-girl-slice.jpg',
      '/products/classic-cakes/milk-girl-top.jpg',
    ],
  },
  {
    slug: 'eclair-large-pineapple',
    image_url: '/products/eclairs/pineapple.png',
    image_urls: [],
  },
];

for (const row of updates) {
  for (const url of [row.image_url, ...row.image_urls]) {
    const ok = existsSync(join(root, 'public', url.slice(1)));
    console.log(ok ? 'FILE_OK' : 'FILE_MISSING', url);
  }
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

for (const row of updates) {
  const primaryExists = existsSync(join(root, 'public', row.image_url.slice(1)));
  if (!primaryExists) {
    console.error('SKIP', row.slug, 'primary missing');
    continue;
  }
  const { data, error } = await sb
    .from('products')
    .update({
      image_url: row.image_url,
      image_urls: row.image_urls.filter((u) => existsSync(join(root, 'public', u.slice(1)))),
    })
    .eq('slug', row.slug)
    .select('slug,image_url,image_urls')
    .maybeSingle();
  if (error) console.error('FAIL', row.slug, error.message);
  else console.log('SYNCED', JSON.stringify(data));
}
