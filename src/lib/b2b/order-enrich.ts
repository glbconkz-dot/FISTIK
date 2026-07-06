import { tryCreateServiceClient } from '@/lib/supabase/service';

export async function getB2BCompanyNames(
  customerIds: string[]
): Promise<Record<string, string>> {
  const unique = [...new Set(customerIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const supabase = tryCreateServiceClient();
  if (!supabase) return {};

  const { data, error } = await supabase
    .from('b2b_customers')
    .select('id, company_name')
    .in('id', unique);

  if (error || !data) {
    console.error('getB2BCompanyNames:', error?.message);
    return {};
  }

  return Object.fromEntries(data.map((row) => [row.id as string, row.company_name as string]));
}
