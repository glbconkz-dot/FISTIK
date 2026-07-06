/** Map Supabase/Postgres errors to B2B admin error codes */
export function mapB2BSupabaseError(error: { message?: string; code?: string } | null): {
  code: string;
  detail?: string;
} {
  const msg = error?.message ?? '';
  const code = error?.code ?? '';

  if (code === '23505' || msg.includes('duplicate key') || msg.includes('b2b_customers_phone')) {
    return { code: 'phoneExists' };
  }

  if (
    code === '42P01' ||
    msg.includes('does not exist') ||
    msg.includes('schema cache') ||
    msg.includes('Could not find the table')
  ) {
    return {
      code: 'schemaMissing',
      detail: msg,
    };
  }

  if (msg.includes('permission denied') || code === '42501') {
    return { code: 'permissionDenied', detail: msg };
  }

  if (msg.includes('JWT') || msg.includes('Invalid API key')) {
    return { code: 'invalidServiceKey', detail: msg };
  }

  return { code: 'saveFailed', detail: msg || undefined };
}
