/**
 * WhatsApp hat yönlendirme denetimi (B2C / B2B / şubeler).
 * Run: node scripts/audit-whatsapp-routing.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const expected = {
  almaty: '77010995571',
  kaskelen: '77782681755',
  b2b: '77010995573',
  branch: 'kaskelen',
};

function digits(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  return d.length === 10 ? `7${d}` : d;
}

let ok = true;
const checkDigits = (label, got, want) => {
  const g = digits(got);
  const w = digits(want);
  const pass = g === w;
  console.log(pass ? 'OK  ' : 'FAIL', label, '→', g || '(empty)', pass ? '' : `(expected ${w})`);
  if (!pass) ok = false;
};
const checkText = (label, got, want) => {
  const g = String(got || '').trim().toLowerCase();
  const w = String(want || '').trim().toLowerCase();
  const pass = g === w;
  console.log(pass ? 'OK  ' : 'FAIL', label, '→', g || '(empty)', pass ? '' : `(expected ${w})`);
  if (!pass) ok = false;
};

const envPath = join(root, '.env.local');
const env = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
}

const deploy = readFileSync(join(root, 'deploy/VERCEL-ORTAM-DEGISKENLERI.env'), 'utf8');
const deployVars = Object.fromEntries(
  deploy
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const businessSrc = readFileSync(join(root, 'src/lib/business.ts'), 'utf8');
const b2bLinkSrc = readFileSync(join(root, 'src/lib/b2b/whatsapp-link.ts'), 'utf8');

checkDigits('code Almaty digits', businessSrc.match(/almaty:\s*\{[\s\S]*?digits:\s*'(\d+)'/)?.[1], expected.almaty);
checkDigits('code Kaskelen digits', businessSrc.match(/kaskelen:\s*\{[\s\S]*?digits:\s*'(\d+)'/)?.[1], expected.kaskelen);
checkDigits(
  'code B2B default',
  businessSrc.match(/B2B_WHATSAPP_DIGITS_DEFAULT\s*=\s*'(\d+)'/)?.[1],
  expected.b2b
);
checkDigits(
  'b2b-link uses getOrderWhatsAppDigits',
  b2bLinkSrc.includes("getOrderWhatsAppDigits('b2b')") ? expected.b2b : '',
  expected.b2b
);

checkDigits('local B2C', env.NEXT_PUBLIC_WHATSAPP_NUMBER || expected.kaskelen, expected.kaskelen);
checkDigits('local B2B', env.NEXT_PUBLIC_B2B_WHATSAPP_NUMBER || expected.b2b, expected.b2b);
checkText('local branch', env.NEXT_PUBLIC_B2C_ORDER_BRANCH || expected.branch, expected.branch);

checkDigits('deploy B2C', deployVars.NEXT_PUBLIC_WHATSAPP_NUMBER, expected.kaskelen);
checkDigits('deploy B2B', deployVars.NEXT_PUBLIC_B2B_WHATSAPP_NUMBER, expected.b2b);
checkText('deploy branch', deployVars.NEXT_PUBLIC_B2C_ORDER_BRANCH || expected.branch, expected.branch);

console.log('');
console.log('Routing map:');
console.log('  B2C web order WA →', expected.kaskelen, '(Kaskelen; Almaty hazır olunca NEXT_PUBLIC_B2C_ORDER_BRANCH=almaty)');
console.log('  B2B web order WA →', expected.b2b);
console.log('  Almaty branch    →', expected.almaty);
console.log('  Kaskelen branch  →', expected.kaskelen);

if (!ok) {
  console.error('\nAudit FAILED');
  process.exit(1);
}
console.log('\nWhatsApp routing audit passed.');
