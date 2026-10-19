import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath =
  process.argv[2] ??
  join(root, '.cursor-cache', 'catalog.json');

function esc(value) {
  const s = value == null ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function loadCatalog() {
  if (catalogPath.startsWith('http')) {
    const res = await fetch(catalogPath);
    if (!res.ok) throw new Error(`Catalog fetch failed: ${res.status}`);
    return res.json();
  }
  return JSON.parse(readFileSync(catalogPath, 'utf8'));
}

const data = await loadCatalog();
const categories = new Map((data.categories ?? []).map((c) => [c.id, c]));

const headers = [
  'Kategori (TR)',
  'Kategori (RU)',
  'Kategori (KK)',
  'Kategori (EN)',
  'Slug',
  'Urun (TR)',
  'Urun (RU)',
  'Urun (KK)',
  'Urun (EN)',
  'Fiyat (KZT)',
  'Stok',
  'Aktif',
  'Sira',
  'Aciklama (TR)',
];

const products = [...(data.products ?? [])].sort((a, b) => {
  const ca = categories.get(a.category_id);
  const cb = categories.get(b.category_id);
  const order = (ca?.sort_order ?? 999) - (cb?.sort_order ?? 999);
  if (order !== 0) return order;
  return (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.slug.localeCompare(b.slug);
});

const rows = [headers.join(',')];
for (const p of products) {
  const c = categories.get(p.category_id) ?? {};
  rows.push(
    [
      c.name_tr,
      c.name_ru,
      c.name_kk,
      c.name_en,
      p.slug,
      p.name_tr,
      p.name_ru,
      p.name_kk,
      p.name_en,
      p.price,
      p.stock_quantity,
      p.is_active ? 'Evet' : 'Hayir',
      p.sort_order,
      (p.description_tr ?? '').replace(/\s+/g, ' ').trim(),
    ]
      .map(esc)
      .join(',')
  );
}

const out = join(root, 'fistik-menu-urunler.csv');
writeFileSync(out, `\uFEFF${rows.join('\r\n')}`, 'utf8');
console.log(`products: ${products.length}`);
console.log(`categories: ${categories.size}`);
console.log(`written: ${out}`);
