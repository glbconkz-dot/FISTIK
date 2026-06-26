import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseEnv, requireSupabaseEnv } from '@/lib/supabase/env';

export async function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component — ignore
        }
      },
    },
  });
}

export async function tryCreateClient() {
  const env = getSupabaseEnv();
  if (!env.isConfigured) return null;
  return createClient();
}

export async function getAdminUser() {
  const supabase = await tryCreateClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('id, full_name')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return { user, profile };
}
