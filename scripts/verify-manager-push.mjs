/**
 * Verify admin_device_tokens + live manager API.
 * Does not print secrets.
 */
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env.local');

function loadEnv(path) {
  const vars = {};
  if (!existsSync(path)) return vars;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    vars[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return vars;
}

const env = loadEnv(envPath);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await supabase.from('admin_device_tokens').select('id').limit(1);
if (error) {
  console.log('TABLE=fail');
  console.log('ERR=', error.code || '', error.message);
  process.exit(1);
}
console.log('TABLE=ok');
console.log('ROWS=', (data ?? []).length);

const secret = env.MANAGER_APP_SECRET;
if (!secret) {
  console.log('API=skip_no_secret');
  process.exit(0);
}
console.log('SECRET_FP=', createHash('sha256').update(secret).digest('hex').slice(0, 12));

const res = await fetch('https://fistik.kz/api/manager/orders?limit=5', {
  headers: { Authorization: `Bearer ${secret}` },
});
const text = await res.text();
console.log('API_STATUS=', res.status);
if (res.ok) {
  try {
    const json = JSON.parse(text);
    console.log('API=ok');
    console.log('ORDERS=', Array.isArray(json.orders) ? json.orders.length : 0);
  } catch {
    console.log('API=bad_json');
  }
} else {
  console.log('API_BODY=', text.slice(0, 200));
  process.exit(2);
}
