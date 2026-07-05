import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const content = readFileSync(join(root, 'src/data/menu.ts'), 'utf8');
const re =
  /product\(\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+)(?:,\s*(?:'([^']*)'|undefined))?(?:,\s*(\d+))?\s*\)/g;

const prices = [];
let match;
while ((match = re.exec(content)) !== null) {
    prices.push({ slug: match[1], price: match[8] ? Number(match[8]) : 1500 });
}

const cases = prices.map((p) => `  WHEN '${p.slug}' THEN ${p.price}`).join('\n');
const sql = `-- FISTIK — ürün fiyatları (menu.ts ile senkron)
-- Supabase SQL Editor → bir kez çalıştırın

UPDATE products SET price = CASE slug
${cases}
  ELSE 1500
END;
`;

const outPath = join(root, 'supabase/update-product-prices.sql');
writeFileSync(outPath, sql);
console.log(`Wrote ${prices.length} prices → ${outPath}`);
