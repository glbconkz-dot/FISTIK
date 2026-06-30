/**
 * menu.ts + menu-names.ts birlestirerek RU/KK/TR slug sozlukleri ve Supabase SQL uretir.
 * Calistir: node scripts/sync-localized-names.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const menuPath = resolve(root, 'src/data/menu.ts');
const menuNamesPath = resolve(root, 'src/data/menu-names.ts');
const content = readFileSync(menuPath, 'utf8');

/** menu.ts icindeki Latin/Turkce name_ru -> dogru Rusca */
const RU_OVERRIDES = {
  'classic-round-cakes': 'Классические круглые торты',
  'american-cakes': 'Американские торты',
  'mango-coconut-mousse': 'Мусс манго-кокос',
  'ferrero-hazelnut-mousse': 'Мусс Ferrero с фундуком',
  'cake-snickers': 'Торт Snickers',
  'cake-medovik': 'Медовик',
  'cake-milk-girl': 'Торт «Молочная девочка»',
  'cake-whoopie-pie': 'Whoopie Pie',
  'cake-red-velvet': 'Red Velvet',
  'cake-chocolate': 'Шоколадный торт',
  'cake-pistachio-raspberry': 'Торт фисташка-малина',
  'pie-apple-walnut-cinnamon': 'Пирог яблоко-орех-корица',
  'pie-snickers': 'Пирог Snickers',
  'pie-quark': 'Творожный пирог',
  'pie-meat': 'Мясной пирог',
  'pie-chicken': 'Пирог с курицей',
  'pie-spinach-cheese': 'Пирог шпинат-сыр',
  'pie-cheese': 'Сырный пирог',
  'kucuk-borek': 'Маленький борек',
  'sarma-borek': 'Борек сarma',
  'semi-waffle': 'Вафли',
};

function hasCyrillic(value) {
  return /[\u0400-\u04FF]/.test(value);
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
}));

const productBlocks = [
  ...content.matchAll(
    /product\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+)/g
  ),
].map((m) => ({
  slug: m[1],
  name_en: m[3],
  name_ru: m[4],
}));

const CATEGORY_RU = {};
for (const c of categoryBlocks) {
  CATEGORY_RU[c.slug] = RU_OVERRIDES[c.slug] ?? (hasCyrillic(c.name_ru) ? c.name_ru : c.name_en);
}

const PRODUCT_RU = {};
for (const p of productBlocks) {
  PRODUCT_RU[p.slug] = RU_OVERRIDES[p.slug] ?? (hasCyrillic(p.name_ru) ? p.name_ru : p.name_en);
}

function formatRecord(name, obj) {
  const lines = Object.entries(obj)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slug, label]) => `  '${slug}': '${String(label).replace(/'/g, "\\'")}',`);
  return `export const ${name}: Record<string, string> = {\n${lines.join('\n')}\n};`;
}

const menuNames = readFileSync(menuNamesPath, 'utf8');
const marker = '/** AUTO: localized RU maps — sync-localized-names.mjs */';
const autoBlock = `${marker}\n${formatRecord('CATEGORY_RU', CATEGORY_RU)}\n\n${formatRecord('PRODUCT_RU', PRODUCT_RU)}\n`;

const cleaned = menuNames.replace(
  /\/\*\* AUTO: localized RU maps[\s\S]*?(?=\nexport const PRODUCT_TR|\nexport const CATEGORY_TR|$)/,
  ''
);

const insertAt = cleaned.indexOf('export const PRODUCT_TR:');
const next =
  insertAt >= 0
    ? `${cleaned.slice(0, insertAt)}${autoBlock}\n${cleaned.slice(insertAt)}`
    : `${cleaned}\n${autoBlock}`;

writeFileSync(menuNamesPath, next, 'utf8');

function sqlValues(map, column) {
  return Object.entries(map)
    .map(([slug, name]) => {
      const s = slug.replace(/'/g, "''");
      const n = String(name).replace(/'/g, "''");
      return `  ('${s}', '${n}')`;
    })
    .join(',\n');
}

const migration = `-- Dogru cok dilli isimler (RU/KK/TR)
UPDATE categories AS c
SET name_ru = v.name_ru
FROM (VALUES
${sqlValues(CATEGORY_RU, 'name_ru')}
) AS v(slug, name_ru)
WHERE c.slug = v.slug;

UPDATE products AS p
SET name_ru = v.name_ru
FROM (VALUES
${sqlValues(PRODUCT_RU, 'name_ru')}
) AS v(slug, name_ru)
WHERE p.slug = v.slug;
`;

writeFileSync(resolve(root, 'supabase/migrations/008_fix_localized_names.sql'), migration, 'utf8');
writeFileSync(resolve(root, 'supabase/fix-product-names-ru.sql'), migration, 'utf8');

console.log('Updated menu-names.ts RU maps + 008_fix_localized_names.sql');
