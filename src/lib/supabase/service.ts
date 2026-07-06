import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv, requireSupabaseEnv } from '@/lib/supabase/env';

export function getServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

export function createServiceClient() {
  const { url } = requireSupabaseEnv();
  const key = getServiceRoleKey();
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for B2B operations');
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function tryCreateServiceClient() {
  const env = getSupabaseEnv();
  const key = getServiceRoleKey();
  if (!env.isConfigured || !key) return null;
  return createClient(env.url!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
