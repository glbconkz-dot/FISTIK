import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from '@/lib/supabase/env';

export function createBrowserSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured) return null;

  return createBrowserClient(url, anonKey, {
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
