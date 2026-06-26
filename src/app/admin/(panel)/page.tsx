import { createClient } from '@/lib/supabase/server';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import type { Order } from '@/types';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: activeProducts }, { data: orders }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
  ]);

  return (
    <AdminDashboardClient
      orders={(orders as Order[]) ?? []}
      activeProducts={activeProducts ?? 0}
    />
  );
}
