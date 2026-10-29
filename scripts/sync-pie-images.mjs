import { readFileSync } from 'node:fs';
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

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const updates = [
  {
    slug: 'pie-meat',
    image_url: '/products/pies/meat.png',
    image_urls: ['/products/pies/meat-slice.png'],
  },
  {
    slug: 'pie-chicken',
    image_url: '/products/pies/chicken.png',
    image_urls: ['/products/pies/chicken-slice.png'],
  },
  {
    slug: 'pie-spinach-cheese',
    image_url: '/products/pies/spinach-cheese.png',
    image_urls: ['/products/pies/spinach-cheese-slice.png'],
  },
  {
    slug: 'pie-cheese',
    image_url: '/products/pies/cheese.png',
    image_urls: [],
  },
];

for (const row of updates) {
  const { data, error } = await sb
    .from('products')
    .update({ image_url: row.image_url, image_urls: row.image_urls })
    .eq('slug', row.slug)
    .select('slug,image_url,image_urls')
    .maybeSingle();
  if (error) {
    console.error('FAIL', row.slug, error.message);
    process.exitCode = 1;
  } else {
    console.log('OK', JSON.stringify(data));
  }
}
