import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCT_TR } from '../src/data/menu-names.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rows = Object.entries(PRODUCT_TR)
  .map(([slug, name]) => {
    const s = slug.replace(/'/g, "''");
    const n = name.replace(/'/g, "''");
    return `  ('${s}', '${n}')`;
  })
  .join(',\n');

const sql = `-- Turkce urun isimleri — Supabase SQL Editor'de bir kez calistirin
UPDATE products AS p
SET name_tr = v.name_tr
FROM (VALUES
${rows}
) AS v(slug, name_tr)
WHERE p.slug = v.slug;
`;

writeFileSync(resolve(root, 'supabase/fix-product-names-tr.sql'), sql, 'utf8');
console.log('Wrote supabase/fix-product-names-tr.sql');
