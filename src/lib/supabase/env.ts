const PLACEHOLDER_MARKERS = ['your-project', 'your-supabase'];

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

  const isPlaceholder =
    PLACEHOLDER_MARKERS.some((marker) => url.includes(marker) || anonKey.includes(marker));

  const isConfigured = Boolean(url && anonKey && !isPlaceholder);

  return { url, anonKey, isConfigured };
}

export function requireSupabaseEnv() {
  const env = getSupabaseEnv();

  if (!env.isConfigured) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env.local and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return { url: env.url, anonKey: env.anonKey };
}
