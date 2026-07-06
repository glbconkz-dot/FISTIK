import { createClient } from '@/lib/supabase/server';
import { getB2BCompanyNames } from '@/lib/b2b/order-enrich';
import { AdminSqlNotice } from '@/components/admin/AdminSqlNotice';
import { OrdersList } from '@/components/admin/OrdersList';
import type { Order } from '@/types';

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

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
      ? companyNames[order.b2b_customer_id] ?? null
      : null,
  }));

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
