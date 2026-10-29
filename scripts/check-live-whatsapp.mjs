import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = {};
const envPath = join(root, '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
}
console.log('local B2B', env.NEXT_PUBLIC_B2B_WHATSAPP_NUMBER || '(missing)');
console.log('local B2C', env.NEXT_PUBLIC_WHATSAPP_NUMBER || '(missing)');

const deploy = readFileSync(join(root, 'deploy/VERCEL-ORTAM-DEGISKENLERI.env'), 'utf8');
console.log(
  'deploy B2B',
  deploy.match(/NEXT_PUBLIC_B2B_WHATSAPP_NUMBER=(.+)/)?.[1]?.trim()
);

const html = await fetch('https://fistik.kz/ru').then((r) => r.text());
const nums = [...new Set([...html.matchAll(/wa\.me\/(\d+)/g)].map((m) => m[1]))];
console.log('live wa.me', nums);
const all = [...new Set([...html.matchAll(/7\d{10}/g)].map((m) => m[0]))];
console.log('live 11-digit', all.slice(0, 15));
