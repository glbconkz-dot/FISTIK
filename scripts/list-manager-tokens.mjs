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
  .select('id, device_name, platform, is_active, last_seen_at, updated_at, expo_push_token')
  .order('updated_at', { ascending: false });

if (error) {
  console.log('ERR', error.message);
  process.exit(1);
}

console.log('COUNT', data?.length ?? 0);
for (const d of data ?? []) {
  console.log(
    JSON.stringify({
      id: d.id.slice(0, 8),
      name: d.device_name,
      platform: d.platform,
      active: d.is_active,
      last: d.last_seen_at,
      upd: d.updated_at,
      tok: String(d.expo_push_token || '').slice(0, 32),
    })
  );
}
