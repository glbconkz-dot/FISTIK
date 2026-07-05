import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv } from '@/lib/supabase/env';

/** Herkese açık menü okuması — cookie/session gerekmez */
export function createPublicSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured) return null;

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
