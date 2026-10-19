/**
 * One-shot setup: MANAGER_APP_SECRET + admin_device_tokens table check/create attempt.
 * node scripts/setup-manager-push.mjs
 */
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env.local');
const ordersEnvPath = join(root, '..', 'fistik-orders', '.env');

function loadEnvFile(path) {
  const vars = {};
  if (!existsSync(path)) return vars;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    vars[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return vars;
}

function upsertEnvLine(path, key, value) {
  let text = existsSync(path) ? readFileSync(path, 'utf8') : '';
  const re = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}=${value}`;
  if (re.test(text)) text = text.replace(re, line);
  else text = `${text.replace(/\s*$/, '')}\n${line}\n`;
  writeFileSync(path, text, 'utf8');
}

const env = loadEnvFile(envPath);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing Supabase env in .env.local');
  process.exit(1);
}

const secret =
  env.MANAGER_APP_SECRET && env.MANAGER_APP_SECRET !== 'change-me-manager-app-secret'
    ? env.MANAGER_APP_SECRET
    : randomBytes(32).toString('hex');

upsertEnvLine(envPath, 'MANAGER_APP_SECRET', secret);
writeFileSync(
  ordersEnvPath,
  `EXPO_PUBLIC_API_URL=https://fistik.kz\nEXPO_PUBLIC_MANAGER_SECRET=${secret}\n`,
  'utf8'
);

console.log('OK: wrote MANAGER_APP_SECRET to .env.local and fistik-orders/.env');
console.log('secret_fingerprint:', createHash('sha256').update(secret).digest('hex').slice(0, 12));

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { error: selectError } = await supabase.from('admin_device_tokens').select('id').limit(1);

if (!selectError) {
  console.log('OK: admin_device_tokens table already exists');
  process.exit(0);
}

if (selectError.code !== 'PGRST205' && selectError.code !== '42P01' && !selectError.message.includes('does not exist') && !selectError.message.includes('Could not find')) {
  console.error('Unexpected table check error:', selectError.code, selectError.message);
}

// Try database URL if present (direct SQL)
const dbUrl = env.DATABASE_URL || env.SUPABASE_DB_URL || env.POSTGRES_URL;
if (dbUrl) {
  try {
    const pg = await import('pg');
    const client = new pg.default.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();
    await client.query(`
CREATE TABLE IF NOT EXISTS admin_device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expo_push_token text NOT NULL UNIQUE,
  device_name text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT 'ios',
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_device_tokens_active_idx
  ON admin_device_tokens(is_active)
  WHERE is_active = true;
ALTER TABLE admin_device_tokens ENABLE ROW LEVEL SECURITY;
`);
    await client.end();
    console.log('OK: created admin_device_tokens via DATABASE_URL');
    process.exit(0);
  } catch (e) {
    console.error('DATABASE_URL SQL failed:', e instanceof Error ? e.message : e);
  }
}

console.log('NEED_SQL: open Supabase SQL Editor and run supabase/migrations/026_admin_device_tokens.sql');
console.log('SQL_FILE:', join(root, 'supabase/migrations/026_admin_device_tokens.sql'));
process.exit(2);
