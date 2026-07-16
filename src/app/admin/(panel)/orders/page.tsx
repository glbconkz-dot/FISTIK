import { createClient } from '@/lib/supabase/server';
import {
  ADMIN_ORDER_LIST_COLUMNS,
  ADMIN_ORDERS_LIST_LIMIT,
  enrichAdminOrders,
  getAdminOrdersListSince,
} from '@/lib/admin/orders-query';
import { AdminSqlNotice } from '@/components/admin/AdminSqlNotice';
import { OrdersList } from '@/components/admin/OrdersList';
import type { Order } from '@/types';

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from('orders')
    .select(ADMIN_ORDER_LIST_COLUMNS)
    .gte('created_at', getAdminOrdersListSince())
    .order('created_at', { ascending: false })
    .limit(ADMIN_ORDERS_LIST_LIMIT);

  const enriched = await enrichAdminOrders((rows as Order[]) ?? []);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Siparişler</h1>
      <p className="mt-1 text-muted">
        B2C ve B2B siparişleri — B2B için ödeme işaretleme ve kanal filtresi
      </p>
      <div className="mt-8">
        <AdminSqlNotice />
        <OrdersList orders={enriched} />
      </div>
    </div>
  );
}
