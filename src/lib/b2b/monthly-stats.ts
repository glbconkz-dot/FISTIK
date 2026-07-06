import {
  B2B_DISCOUNT_TIER_3_THRESHOLD,
  B2B_DISCOUNT_TIER_6_THRESHOLD,
} from '@/lib/b2b/constants';

export function yearMonthFromDate(iso: string): string {
  return iso.slice(0, 7);
}

export function discountForPaidTotal(paidTotal: number): 0 | 3 | 6 {
  if (paidTotal >= B2B_DISCOUNT_TIER_6_THRESHOLD) return 6;
  if (paidTotal >= B2B_DISCOUNT_TIER_3_THRESHOLD) return 3;
  return 0;
}

/** Next calendar month key (YYYY-MM) from a YYYY-MM string */
export function nextYearMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const date = new Date(y!, m!, 1);
  return yearMonthFromDate(date.toISOString());
}

/** Previous calendar month key (YYYY-MM) */
export function previousYearMonth(yearMonth?: string): string {
  const base = yearMonth ?? yearMonthFromDate(new Date().toISOString());
  const [y, m] = base.split('-').map(Number);
  const date = new Date(y!, m! - 2, 1);
  return yearMonthFromDate(date.toISOString());
}

export async function getActiveDiscountTier(customerId: string): Promise<0 | 3 | 6> {
  const { tryCreateServiceClient } = await import('@/lib/supabase/service');
  const supabase = tryCreateServiceClient();
  if (!supabase) return 0;

  const prevMonth = previousYearMonth();

  const { data } = await supabase
    .from('b2b_monthly_stats')
    .select('paid_total')
    .eq('customer_id', customerId)
    .eq('year_month', prevMonth)
    .maybeSingle();

  return discountForPaidTotal(Number(data?.paid_total ?? 0));
}

export async function recordB2BPayment(
  customerId: string,
  amount: number,
  paidAtIso: string
): Promise<void> {
  const { tryCreateServiceClient } = await import('@/lib/supabase/service');
  const supabase = tryCreateServiceClient();
  if (!supabase || amount <= 0) return;

  const yearMonth = yearMonthFromDate(paidAtIso);

  const { data: existing } = await supabase
    .from('b2b_monthly_stats')
    .select('id, paid_total')
    .eq('customer_id', customerId)
    .eq('year_month', yearMonth)
    .maybeSingle();

  const newTotal = Number(existing?.paid_total ?? 0) + amount;

  if (existing?.id) {
    await supabase
      .from('b2b_monthly_stats')
      .update({
        paid_total: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('b2b_monthly_stats').insert({
      customer_id: customerId,
      year_month: yearMonth,
      paid_total: newTotal,
    });
  }

  const nextMonth = nextYearMonth(yearMonth);
  const discount = discountForPaidTotal(newTotal);

  const { data: nextRow } = await supabase
    .from('b2b_monthly_stats')
    .select('id')
    .eq('customer_id', customerId)
    .eq('year_month', nextMonth)
    .maybeSingle();

  if (nextRow?.id) {
    await supabase
      .from('b2b_monthly_stats')
      .update({
        discount_for_next_month: discount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', nextRow.id);
  } else {
    await supabase.from('b2b_monthly_stats').insert({
      customer_id: customerId,
      year_month: nextMonth,
      paid_total: 0,
      discount_for_next_month: discount,
    });
  }
}

export async function reverseB2BPayment(
  customerId: string,
  amount: number,
  paidAtIso: string
): Promise<void> {
  const { tryCreateServiceClient } = await import('@/lib/supabase/service');
  const supabase = tryCreateServiceClient();
  if (!supabase || amount <= 0) return;

  const yearMonth = yearMonthFromDate(paidAtIso);

  const { data: existing } = await supabase
    .from('b2b_monthly_stats')
    .select('id, paid_total')
    .eq('customer_id', customerId)
    .eq('year_month', yearMonth)
    .maybeSingle();

  if (!existing) return;

  const newTotal = Math.max(0, Number(existing.paid_total) - amount);

  await supabase
    .from('b2b_monthly_stats')
    .update({
      paid_total: newTotal,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id);

  const nextMonth = nextYearMonth(yearMonth);
  const discount = discountForPaidTotal(newTotal);

  await supabase
    .from('b2b_monthly_stats')
    .update({
      discount_for_next_month: discount,
      updated_at: new Date().toISOString(),
    })
    .eq('customer_id', customerId)
    .eq('year_month', nextMonth);
}
