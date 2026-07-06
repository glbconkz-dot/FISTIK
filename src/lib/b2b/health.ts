import { tryCreateServiceClient } from '@/lib/supabase/service';

export type B2BHealthReason =
  | 'noServiceRole'
  | 'schemaMissing'
  | 'unknown';

export async function checkB2BSchemaReady(): Promise<{
  ok: boolean;
  reason?: B2BHealthReason;
  detail?: string;
}> {
  const supabase = tryCreateServiceClient();
  if (!supabase) {
    return { ok: false, reason: 'noServiceRole' };
  }

  const { error } = await supabase.from('b2b_customers').select('id').limit(1);

  if (!error) {
    return { ok: true };
  }

  const msg = error.message ?? '';

  if (
    error.code === '42P01' ||
    msg.includes('does not exist') ||
    msg.includes('schema cache') ||
    msg.includes('Could not find the table')
  ) {
    return { ok: false, reason: 'schemaMissing', detail: msg };
  }

  return { ok: false, reason: 'unknown', detail: msg };
}
