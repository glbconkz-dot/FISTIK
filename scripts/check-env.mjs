#!/usr/bin/env node
/**
 * Quick check: are Supabase env vars set (not placeholders)?
 * Run: node scripts/check-env.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env.local');

if (!existsSync(envPath)) {
  console.error('❌ .env.local bulunamadı. .env.example dosyasını kopyalayın.');
  process.exit(1);
}

const raw = readFileSync(envPath, 'utf8');
const vars = Object.fromEntries(
  raw
    .split('\n')
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const i = line.indexOf('=');
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    })
);

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
];

const placeholders = ['your-project', 'your-supabase'];

let ok = true;

for (const key of required) {
  const val = vars[key] ?? '';
  const bad =
    !val || placeholders.some((p) => val.includes(p));
  if (bad) {
    console.error(`❌ ${key} ayarlanmamış veya placeholder`);
    ok = false;
  } else {
    console.log(`✅ ${key}`);
  }
}

if (ok) {
  console.log('\nSupabase yapılandırması hazır görünüyor. npm run dev ile test edin.');
} else {
  console.log('\nKURULUM.md dosyasındaki Bölüm 1–2 adımlarını tamamlayın.');
  process.exit(1);
}
