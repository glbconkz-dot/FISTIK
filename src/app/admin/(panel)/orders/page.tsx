import { createClient } from '@/lib/supabase/server';
import { AdminSqlNotice } from '@/components/admin/AdminSqlNotice';
import { OrdersList } from '@/components/admin/OrdersList';
import type { Order } from '@/types';

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Siparişler</h1>
      <p className="mt-1 text-muted">
        1 Yeni → arayıp onayla (teslim saati) → 2 Sevkiyat bekleyen → 3 Kuryeye ver → 4
        Teslim gelince tamamla
      </p>
      <div className="mt-8">
        <AdminSqlNotice />
        <OrdersList orders={(orders as Order[]) ?? []} />
      </div>
    </div>
  );
}
