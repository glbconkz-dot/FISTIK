import { tryCreateServiceClient } from '@/lib/supabase/service';
import {
  discountForPaidTotal,
  previousYearMonth,
  yearMonthFromDate,
} from '@/lib/b2b/monthly-stats';

export interface B2BMonthlyReportRow {
  customerId: string;
  companyName: string;
  phone: string;
  isActive: boolean;
  previousMonthPaid: number;
  currentMonthPaid: number;
  activeDiscount: 0 | 3 | 6;
  nextMonthDiscount: 0 | 3 | 6;
  unpaidOrderCount: number;
  unpaidOrderTotal: number;
}

export interface B2BMonthlyReport {
  currentMonth: string;
  previousMonth: string;
  rows: B2BMonthlyReportRow[];
  totals: {
    currentMonthPaid: number;
    previousMonthPaid: number;
    unpaidTotal: number;
  };
}

function monthRange(yearMonth: string): { start: string; end: string } {
  const [y, m] = yearMonth.split('-').map(Number);
  const start = new Date(y!, m! - 1, 1);
  const end = new Date(y!, m!, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function buildB2BMonthlyReport(
  yearMonth?: string
): Promise<B2BMonthlyReport | null> {
  const supabase = tryCreateServiceClient();
  if (!supabase) return null;

  const currentMonth = yearMonth ?? yearMonthFromDate(new Date().toISOString());
  const prevMonth = previousYearMonth(currentMonth);
  const { start, end } = monthRange(currentMonth);

  const [{ data: customers }, { data: stats }, { data: unpaidOrders }] = await Promise.all([
    supabase
      .from('b2b_customers')
      .select('id, company_name, phone, is_active')
      .order('company_name', { ascending: true }),
    supabase
      .from('b2b_monthly_stats')
      .select('customer_id, year_month, paid_total')
      .in('year_month', [currentMonth, prevMonth]),
    supabase
      .from('orders')
      .select('b2b_customer_id, total')
      .eq('order_channel', 'b2b')
      .eq('payment_status', 'pending')
      .gte('created_at', start)
      .lt('created_at', end),
  ]);

  if (!customers) return null;

  const paidByCustomerMonth = new Map<string, number>();
  for (const row of stats ?? []) {
    paidByCustomerMonth.set(`${row.customer_id}:${row.year_month}`, Number(row.paid_total));
  }

  const unpaidByCustomer = new Map<string, { count: number; total: number }>();
  for (const order of unpaidOrders ?? []) {
    const cid = order.b2b_customer_id as string | null;
    if (!cid) continue;
    const entry = unpaidByCustomer.get(cid) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += Number(order.total);
    unpaidByCustomer.set(cid, entry);
  }

  const rows: B2BMonthlyReportRow[] = customers.map((c) => {
    const previousMonthPaid = paidByCustomerMonth.get(`${c.id}:${prevMonth}`) ?? 0;
    const currentMonthPaid = paidByCustomerMonth.get(`${c.id}:${currentMonth}`) ?? 0;
    const unpaid = unpaidByCustomer.get(c.id) ?? { count: 0, total: 0 };

    return {
      customerId: c.id,
      companyName: c.company_name,
      phone: c.phone,
      isActive: c.is_active,
      previousMonthPaid,
      currentMonthPaid,
      activeDiscount: discountForPaidTotal(previousMonthPaid),
      nextMonthDiscount: discountForPaidTotal(currentMonthPaid),
      unpaidOrderCount: unpaid.count,
      unpaidOrderTotal: unpaid.total,
    };
  });

  return {
    currentMonth,
    previousMonth: prevMonth,
    rows,
    totals: {
      currentMonthPaid: rows.reduce((s, r) => s + r.currentMonthPaid, 0),
      previousMonthPaid: rows.reduce((s, r) => s + r.previousMonthPaid, 0),
      unpaidTotal: rows.reduce((s, r) => s + r.unpaidOrderTotal, 0),
    },
  };
}

export async function syncB2BCustomerDiscountTier(customerId: string): Promise<void> {
  const supabase = tryCreateServiceClient();
  if (!supabase) return;

  const { getActiveDiscountTier } = await import('@/lib/b2b/monthly-stats');
  const tier = await getActiveDiscountTier(customerId);

  await supabase
    .from('b2b_customers')
    .update({ discount_tier: tier, updated_at: new Date().toISOString() })
    .eq('id', customerId);
}
