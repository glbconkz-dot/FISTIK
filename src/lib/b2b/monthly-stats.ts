import {
  B2B_DISCOUNT_TIER_3_THRESHOLD,
  B2B_DISCOUNT_TIER_6_THRESHOLD,
} from '@/lib/b2b/constants';
import { STORE_TIMEZONE } from '@/lib/order-dates';

/** YYYY-MM in store timezone (Asia/Almaty) */
export function yearMonthInStoreTimezone(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: STORE_TIMEZONE }).format(date).slice(0, 7);
}

export function yearMonthFromDate(iso: string): string {
  return yearMonthInStoreTimezone(new Date(iso));
}

export function discountForPaidTotal(paidTotal: number): 0 | 3 | 6 {
  if (paidTotal >= B2B_DISCOUNT_TIER_6_THRESHOLD) return 6;
  if (paidTotal >= B2B_DISCOUNT_TIER_3_THRESHOLD) return 3;
  return 0;
}

/** Next calendar month key (YYYY-MM) */
export function nextYearMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  let year = y!;
  let month = m! + 1;
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

/** Previous calendar month key (YYYY-MM) */
export function previousYearMonth(yearMonth?: string): string {
  const base = yearMonth ?? yearMonthInStoreTimezone();
  const [y, m] = base.split('-').map(Number);
  let year = y!;
  let month = m! - 1;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Paid B2B order totals for current + previous calendar months (Almaty).
 * Only admin-"ödendi" orders count.
 */
export async function getPaidTotalsForDiscount(customerId: string): Promise<{
  currentMonthPaid: number;
  previousMonthPaid: number;
  currentMonth: string;
  previousMonth: string;
}> {
  const { tryCreateServiceClient } = await import('@/lib/supabase/service');
  const supabase = tryCreateServiceClient();
  const currentMonth = yearMonthInStoreTimezone();
  const previousMonth = previousYearMonth(currentMonth);

  if (!supabase) {
    return { currentMonthPaid: 0, previousMonthPaid: 0, currentMonth, previousMonth };
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('total, paid_at')
    .eq('order_channel', 'b2b')
    .eq('b2b_customer_id', customerId)
    .eq('payment_status', 'paid')
    .not('paid_at', 'is', null);

  let currentMonthPaid = 0;
  let previousMonthPaid = 0;

  for (const order of orders ?? []) {
    const paidAt = order.paid_at as string;
    const ym = yearMonthFromDate(paidAt);
    const amount = Number(order.total);
    if (ym === currentMonth) currentMonthPaid += amount;
    else if (ym === previousMonth) previousMonthPaid += amount;
  }

  return { currentMonthPaid, previousMonthPaid, currentMonth, previousMonth };
}

/** @deprecated use getPaidTotalsForDiscount */
export async function getPreviousMonthPaidTotal(customerId: string): Promise<number> {
  const { previousMonthPaid } = await getPaidTotalsForDiscount(customerId);
  return previousMonthPaid;
}

/**
 * Active discount applied on the NEXT B2B order (same month — no wait for next month).
 *
 * Rules:
 * - When this month's paid total reaches ≥ 500 000 ₸ → next order gets 3%
 * - When this month's paid total reaches ≥ 1 000 000 ₸ → next order gets 6%
 * - Tier earned last month continues at the start of this month until (and unless)
 *   this month's own paid total unlocks a different / higher result for the month after.
 * Active tier = max(unlock from current-month paid, unlock from previous-month paid).
 */
export function resolveActiveDiscount(
  currentMonthPaid: number,
  previousMonthPaid: number
): 0 | 3 | 6 {
  const fromCurrent = discountForPaidTotal(currentMonthPaid);
  const fromPrevious = discountForPaidTotal(previousMonthPaid);
  return Math.max(fromCurrent, fromPrevious) as 0 | 3 | 6;
}

export async function getActiveDiscountTier(customerId: string): Promise<0 | 3 | 6> {
  const { currentMonthPaid, previousMonthPaid } = await getPaidTotalsForDiscount(customerId);
  return resolveActiveDiscount(currentMonthPaid, previousMonthPaid);
}

async function upsertMonthlyPaidTotal(
  supabase: NonNullable<Awaited<ReturnType<typeof import('@/lib/supabase/service').tryCreateServiceClient>>>,
  customerId: string,
  yearMonth: string,
  newTotal: number
): Promise<boolean> {
  const { data: existing } = await supabase
    .from('b2b_monthly_stats')
    .select('id')
    .eq('customer_id', customerId)
    .eq('year_month', yearMonth)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from('b2b_monthly_stats')
      .update({
        paid_total: newTotal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    return !error;
  }

  const { error } = await supabase.from('b2b_monthly_stats').insert({
    customer_id: customerId,
    year_month: yearMonth,
    paid_total: newTotal,
  });
  return !error;
}

async function upsertNextMonthDiscount(
  supabase: NonNullable<Awaited<ReturnType<typeof import('@/lib/supabase/service').tryCreateServiceClient>>>,
  customerId: string,
  sourceYearMonth: string,
  discount: 0 | 3 | 6
): Promise<boolean> {
  const nextMonth = nextYearMonth(sourceYearMonth);

  const { data: nextRow } = await supabase
    .from('b2b_monthly_stats')
    .select('id, paid_total')
    .eq('customer_id', customerId)
    .eq('year_month', nextMonth)
    .maybeSingle();

  if (nextRow?.id) {
    const { error } = await supabase
      .from('b2b_monthly_stats')
      .update({
        discount_for_next_month: discount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', nextRow.id);
    return !error;
  }

  const { error } = await supabase.from('b2b_monthly_stats').insert({
    customer_id: customerId,
    year_month: nextMonth,
    paid_total: 0,
    discount_for_next_month: discount,
  });
  return !error;
}

export async function recordB2BPayment(
  customerId: string,
  amount: number,
  paidAtIso: string
): Promise<boolean> {
  const { tryCreateServiceClient } = await import('@/lib/supabase/service');
  const supabase = tryCreateServiceClient();
  if (!supabase || amount <= 0) return false;

  const yearMonth = yearMonthFromDate(paidAtIso);

  const { data: existing } = await supabase
    .from('b2b_monthly_stats')
    .select('id, paid_total')
    .eq('customer_id', customerId)
    .eq('year_month', yearMonth)
    .maybeSingle();

  const newTotal = Number(existing?.paid_total ?? 0) + amount;

  if (!(await upsertMonthlyPaidTotal(supabase, customerId, yearMonth, newTotal))) {
    return false;
  }

  const discount = discountForPaidTotal(newTotal);
  if (!(await upsertNextMonthDiscount(supabase, customerId, yearMonth, discount))) {
    return false;
  }

  const { syncB2BCustomerDiscountTier } = await import('@/lib/b2b/monthly-report');
  await syncB2BCustomerDiscountTier(customerId);

  return true;
}

export async function reverseB2BPayment(
  customerId: string,
  amount: number,
  paidAtIso: string
): Promise<boolean> {
  const { tryCreateServiceClient } = await import('@/lib/supabase/service');
  const supabase = tryCreateServiceClient();
  if (!supabase || amount <= 0) return false;

  const yearMonth = yearMonthFromDate(paidAtIso);

  const { data: existing } = await supabase
    .from('b2b_monthly_stats')
    .select('id, paid_total')
    .eq('customer_id', customerId)
    .eq('year_month', yearMonth)
    .maybeSingle();

  if (!existing) return true;

  const newTotal = Math.max(0, Number(existing.paid_total) - amount);

  if (!(await upsertMonthlyPaidTotal(supabase, customerId, yearMonth, newTotal))) {
    return false;
  }

  const discount = discountForPaidTotal(newTotal);
  if (!(await upsertNextMonthDiscount(supabase, customerId, yearMonth, discount))) {
    return false;
  }

  const { syncB2BCustomerDiscountTier } = await import('@/lib/b2b/monthly-report');
  await syncB2BCustomerDiscountTier(customerId);

  return true;
}

/** Recompute discount_tier for every B2B customer from previous month paid totals. */
export async function syncAllB2BCustomerDiscountTiers(): Promise<void> {
  const { tryCreateServiceClient } = await import('@/lib/supabase/service');
  const supabase = tryCreateServiceClient();
  if (!supabase) return;

  const { data: customers } = await supabase.from('b2b_customers').select('id');
  if (!customers?.length) return;

  const { syncB2BCustomerDiscountTier } = await import('@/lib/b2b/monthly-report');
  await Promise.all(customers.map((c) => syncB2BCustomerDiscountTier(c.id)));
}
