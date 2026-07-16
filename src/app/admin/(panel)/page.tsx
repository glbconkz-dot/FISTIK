import { createClient } from '@/lib/supabase/server';
import {
  ADMIN_ORDER_LIST_COLUMNS,
  ADMIN_ORDERS_LIST_LIMIT,
  enrichAdminOrders,
  getAdminOrdersListSince,
} from '@/lib/admin/orders-query';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import type { Order } from '@/types';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: activeProducts }, { data: orders }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('orders')
      .select(ADMIN_ORDER_LIST_COLUMNS)
      .gte('created_at', getAdminOrdersListSince())
      .order('created_at', { ascending: false })
      .limit(ADMIN_ORDERS_LIST_LIMIT),
  ]);

  const enriched = await enrichAdminOrders((orders as Order[]) ?? []);

  return (
    <AdminDashboardClient orders={enriched} activeProducts={activeProducts ?? 0} />
  );
}
