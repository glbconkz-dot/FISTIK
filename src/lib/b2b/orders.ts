import { tryCreateServiceClient } from '@/lib/supabase/service';
import type { Order } from '@/types';

export async function listB2BCustomerOrders(customerId: string): Promise<Order[]> {
  const supabase = tryCreateServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('b2b_customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('listB2BCustomerOrders:', error.message);
    return [];
  }

  return ((data as Order[]) ?? []).map((order) => ({
    ...order,
    order_channel: order.order_channel ?? 'b2b',
    payment_status: order.payment_status ?? 'pending',
    items: Array.isArray(order.items) ? order.items : [],
  }));
}
