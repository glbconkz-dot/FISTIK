import type { Order } from '@/types';

export type OrderChannelFilter = 'all' | 'b2c' | 'b2b';

export function getOrderChannel(order: Order): 'b2c' | 'b2b' {
  return order.order_channel === 'b2b' ? 'b2b' : 'b2c';
}

export function filterOrdersByChannel(orders: Order[], channel: OrderChannelFilter): Order[] {
  if (channel === 'all') return orders;
  return orders.filter((o) => getOrderChannel(o) === channel);
}

export function isB2BOrder(order: Order): boolean {
  return getOrderChannel(order) === 'b2b';
}
