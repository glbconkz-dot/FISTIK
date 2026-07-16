import { NextResponse } from 'next/server';
import { createClient, getAdminUser } from '@/lib/supabase/server';
import { getB2BCompanyNames } from '@/lib/b2b/order-enrich';
import type { Order } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orders = (rows as Order[]) ?? [];
  const b2bIds = orders
    .map((o) => o.b2b_customer_id)
    .filter((id): id is string => Boolean(id));

  const companyNames = await getB2BCompanyNames(b2bIds);

  const enriched = orders.map((order) => ({
    ...order,
    order_channel: order.order_channel ?? 'b2c',
    payment_status: order.payment_status ?? 'pending',
    b2b_company_name: order.b2b_customer_id
      ? (companyNames[order.b2b_customer_id] ?? null)
      : null,
  }));

  return NextResponse.json({
    orders: enriched,
    syncedAt: new Date().toISOString(),
  });
}
