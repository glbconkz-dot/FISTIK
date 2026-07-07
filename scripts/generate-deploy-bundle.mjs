#!/usr/bin/env node
/**
 * Vercel + Supabase için kopyala-yapıştır dosyaları üretir.
 * node scripts/generate-deploy-bundle.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env.local');
const deployDir = join(root, 'deploy');

function loadEnv() {
  if (!existsSync(envPath)) throw new Error('.env.local bulunamadı');
  const vars = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    vars[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return vars;
}

const env = loadEnv();
if (!env.B2B_SESSION_SECRET || env.B2B_SESSION_SECRET === 'change-me-in-production') {
  env.B2B_SESSION_SECRET = randomBytes(32).toString('hex');
}
if (!env.B2B_ADMIN_PASSWORD) env.B2B_ADMIN_PASSWORD = 'Global2026';
if (!env.PRODUCT_DELETE_PIN) env.PRODUCT_DELETE_PIN = '1234';
if (!env.NEXT_PUBLIC_WHATSAPP_BUSINESS) env.NEXT_PUBLIC_WHATSAPP_BUSINESS = 'true';
if (!env.NEXT_PUBLIC_CURRENCY_SYMBOL) env.NEXT_PUBLIC_CURRENCY_SYMBOL = '₸';
if (!env.NEXT_PUBLIC_DEFAULT_LOCALE) env.NEXT_PUBLIC_DEFAULT_LOCALE = 'ru';
env.NEXT_PUBLIC_WHATSAPP_NUMBER = '77014737575';

const vercelKeys = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
  'NEXT_PUBLIC_WHATSAPP_BUSINESS',
  'NEXT_PUBLIC_DEFAULT_LOCALE',
  'NEXT_PUBLIC_CURRENCY_SYMBOL',
  'PRODUCT_DELETE_PIN',
  'B2B_SESSION_SECRET',
  'B2B_ADMIN_PASSWORD',
];

const vercelLines = vercelKeys.map((k) => `${k}=${env[k] ?? ''}`);
mkdirSync(deployDir, { recursive: true });
writeFileSync(join(deployDir, 'VERCEL-ORTAM-DEGISKENLERI.env'), vercelLines.join('\n') + '\n', 'utf8');

const cubeSql = readFileSync(join(root, 'supabase/fix-cube-names-latin.sql'), 'utf8');
const b2bSql = readFileSync(join(root, 'supabase/b2b-kurulum-tam.sql'), 'utf8');
const supabaseSql = `-- FISTIK — Supabase tek seferde yapıştır (SQL Editor → New query → Run)
-- Bölüm 1: Küp ürün Latin isimler
${cubeSql}

-- Bölüm 2: B2B tabloları (zaten varsa atlanır)
${b2bSql}
`;
writeFileSync(join(deployDir, 'SUPABASE-TEK-YAPISTIR.sql'), supabaseSql, 'utf8');

const localLines = readFileSync(envPath, 'utf8').split('\n');
const keysToSet = new Set(vercelKeys);
const out = [];
const seen = new Set();
for (const line of localLines) {
  if (!line || line.startsWith('#') || !line.includes('=')) {
    out.push(line);
    continue;
  }
  const key = line.slice(0, line.indexOf('=')).trim();
  if (keysToSet.has(key)) {
    out.push(`${key}=${env[key]}`);
    seen.add(key);
  } else {
    out.push(line);
  }
}
for (const key of vercelKeys) {
  if (!seen.has(key)) out.push(`${key}=${env[key]}`);
}
writeFileSync(envPath, out.filter((l, i, a) => !(i === a.length - 1 && l === '')).join('\n') + '\n', 'utf8');

console.log('✅ deploy/VERCEL-ORTAM-DEGISKENLERI.env');
console.log('✅ deploy/SUPABASE-TEK-YAPISTIR.sql');
console.log('✅ .env.local güncellendi (B2B + WhatsApp)');
