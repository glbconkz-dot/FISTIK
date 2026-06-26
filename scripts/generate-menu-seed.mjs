import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const menuPath = join(root, 'src/data/menu.ts');
const assetsPath = join(root, 'src/data/product-assets.json');
const content = readFileSync(menuPath, 'utf8');
const productAssets = JSON.parse(readFileSync(assetsPath, 'utf8'));

function escapeSql(value) {
  return value.replace(/'/g, "''");
}

function normalizeName(value) {
  return value
    .toLowerCase()
    .replace(/[—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findProductAsset(product) {
  const productNames = [product.name_en, product.name_ru, product.name_kk, product.name_tr].map(
    normalizeName
  );

  return productAssets.find((asset) => {
    if (asset.slugs?.length) {
      return asset.slugs.includes(product.slug);
    }

    if (asset.category && product.category_slug !== asset.category) {
      return false;
    }

    if (!asset.names?.length) {
      return false;
    }

    return asset.names.some((needle) => {
      const normalizedNeedle = normalizeName(needle);
      return productNames.some((haystack) => {
        if (asset.exact) {
          return haystack === normalizedNeedle;
        }
        return (
          haystack === normalizedNeedle ||
          haystack.includes(normalizedNeedle) ||
          normalizedNeedle.includes(haystack)
        );
      });
    });
  });
}

const categoryBlocks = [
  ...content.matchAll(
    /category\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+)\)/g
  ),
].map((m) => ({
  slug: m[1],
  name_en: m[2],
  name_ru: m[3],
  name_kk: m[4],
  name_tr: m[5],
  sort_order: Number(m[6]),
}));

const productBlocks = [
  ...content.matchAll(
    /product\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+)(?:,\s*'([^']*)')?(?:,\s*(\d+))?\s*\)/g
  ),
].map((m) => ({
  slug: m[1],
  category_slug: m[2],
  name_en: m[3],
  name_ru: m[4],
  name_kk: m[5],
  sort_order: Number(m[6]),
  name_tr: m[7] || m[3],
  price: m[8] ? Number(m[8]) : 1500,
}));

const trOverrides = {};
const trBlock = content.match(/const PRODUCT_TR: Record<string, string> = \{([\s\S]*?)\};/);
if (trBlock) {
  for (const match of trBlock[1].matchAll(/'([^']+)':\s*'([^']*)'/g)) {
    trOverrides[match[1]] = match[2];
  }
}

for (const p of productBlocks) {
  p.name_tr = trOverrides[p.slug] ?? p.name_tr;
}

const desc = {
  en: 'Handcrafted fresh at Fistik bakery, Kaskelen.',
  ru: 'Свеже приготовлено в пекарне Fistik, Каскелен.',
  kk: 'Каскелендегі Fistik пекарнясында жаңа дайындалған.',
  tr: "Kaskelen'deki Fistik fırınında taze hazırlanır.",
};

let sql = `-- FISTIK Full Menu Seed (auto-generated)\n\n`;
sql += `DELETE FROM products;\nDELETE FROM categories;\n\n`;

sql += `INSERT INTO categories (slug, name_en, name_ru, name_kk, name_tr, sort_order) VALUES\n`;
sql += categoryBlocks
  .map(
    (c) =>
      `  ('${c.slug}', '${escapeSql(c.name_en)}', '${escapeSql(c.name_ru)}', '${escapeSql(c.name_kk)}', '${escapeSql(c.name_tr)}', ${c.sort_order})`
  )
  .join(',\n');
sql += `\nON CONFLICT (slug) DO UPDATE SET\n  name_en = EXCLUDED.name_en,\n  name_ru = EXCLUDED.name_ru,\n  name_kk = EXCLUDED.name_kk,\n  name_tr = EXCLUDED.name_tr,\n  sort_order = EXCLUDED.sort_order;\n\n`;

for (const p of productBlocks) {
  const asset = findProductAsset(p);
  const nameEn = asset?.name_en ?? p.name_en;
  const nameRu = asset?.name_ru ?? p.name_ru;
  const nameKk = asset?.name_kk ?? p.name_kk;
  const nameTr = asset?.name_tr ?? p.name_tr;
  const descriptionEn = asset?.description_en ?? desc.en;
  const descriptionRu = asset?.description_ru ?? desc.ru;
  const descriptionKk = asset?.description_kk ?? desc.kk;
  const descriptionTr = asset?.description_tr ?? desc.tr;
  const imageUrl = asset?.image_url ?? '/product-placeholder.jpg';

  sql += `INSERT INTO products (slug, category_id, name_en, name_ru, name_kk, name_tr, description_en, description_ru, description_kk, description_tr, price, image_url, sort_order) VALUES (\n`;
  sql += `  '${p.slug}',\n`;
  sql += `  (SELECT id FROM categories WHERE slug = '${p.category_slug}'),\n`;
  sql += `  '${escapeSql(nameEn)}',\n`;
  sql += `  '${escapeSql(nameRu)}',\n`;
  sql += `  '${escapeSql(nameKk)}',\n`;
  sql += `  '${escapeSql(nameTr)}',\n`;
  sql += `  '${escapeSql(descriptionEn)}',\n`;
  sql += `  '${escapeSql(descriptionRu)}',\n`;
  sql += `  '${escapeSql(descriptionKk)}',\n`;
  sql += `  '${escapeSql(descriptionTr)}',\n`;
  sql += `  ${p.price},\n`;
  sql += `  '${escapeSql(imageUrl)}',\n`;
  sql += `  ${p.sort_order}\n`;
  sql += `) ON CONFLICT (slug) DO UPDATE SET\n`;
  sql += `  category_id = EXCLUDED.category_id,\n`;
  sql += `  name_en = EXCLUDED.name_en,\n  name_ru = EXCLUDED.name_ru,\n  name_kk = EXCLUDED.name_kk,\n  name_tr = EXCLUDED.name_tr,\n`;
  sql += `  description_en = EXCLUDED.description_en,\n  description_ru = EXCLUDED.description_ru,\n  description_kk = EXCLUDED.description_kk,\n  description_tr = EXCLUDED.description_tr,\n`;
  sql += `  price = EXCLUDED.price,\n  image_url = EXCLUDED.image_url,\n  sort_order = EXCLUDED.sort_order;\n\n`;
}

const outPath = join(root, 'supabase/migrations/004_full_menu.sql');
writeFileSync(outPath, sql, 'utf8');
console.log(`Generated ${productBlocks.length} products in ${categoryBlocks.length} categories -> ${outPath}`);
