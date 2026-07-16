import { NextResponse } from 'next/server';
import { createClient, getAdminUser } from '@/lib/supabase/server';
import {
  ADMIN_ORDER_LIST_COLUMNS,
  ADMIN_ORDERS_LIST_LIMIT,
  enrichAdminOrders,
  getAdminOrdersListSince,
} from '@/lib/admin/orders-query';
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
    .select(ADMIN_ORDER_LIST_COLUMNS)
    .gte('created_at', getAdminOrdersListSince())
    .order('created_at', { ascending: false })
    .limit(ADMIN_ORDERS_LIST_LIMIT);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enriched = await enrichAdminOrders((rows as Order[]) ?? []);

  return NextResponse.json({
    orders: enriched,
    syncedAt: new Date().toISOString(),
  });
}
