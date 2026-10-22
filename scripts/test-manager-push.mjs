/**
 * Aktif cihazlara test push gönderir (sipariş uyarısı).
 * node scripts/test-manager-push.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env.local');
const vars = {};
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    vars[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
}

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await supabase
  .from('admin_device_tokens')
  .select('expo_push_token, device_name, is_active')
  .eq('is_active', true);

if (error) {
  console.error('DB', error.message);
  process.exit(1);
}

const tokens = [...new Set((data ?? []).map((d) => d.expo_push_token).filter(Boolean))];
console.log('devices', tokens.length);

if (tokens.length === 0) {
  console.error('No active tokens');
  process.exit(2);
}

const messages = tokens.map((to) => ({
  to,
  title: 'Yeni B2C sipariş',
  body: `#TEST-${Date.now().toString().slice(-6)} · Test · 1.000 ₸`,
  data: { type: 'new_order', orderNumber: 'TEST', channel: 'b2c', adminUrl: 'https://fistik.kz/admin/orders' },
  sound: 'default',
  priority: 'high',
  channelId: 'orders',
  badge: 1,
}));

const res = await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(messages),
});

const text = await res.text();
console.log('HTTP', res.status);
console.log(text.slice(0, 800));
