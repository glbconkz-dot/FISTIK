import { getB2BCompanyNames } from '@/lib/b2b/order-enrich';
import type { Order } from '@/types';

/** List/poll — items JSONB hariç (ağır) */
export const ADMIN_ORDER_LIST_COLUMNS =
  'id, order_number, customer_name, phone, delivery_date, delivery_time, address, cake_text, notes, total, locale, status, stock_deducted, created_at, confirmed_at, shipped_at, completed_at, cancelled_at, cancel_reason, order_channel, b2b_customer_id, b2b_branch_id, discount_percent, subtotal, payment_status, paid_at';

export const ADMIN_ORDERS_LIST_LIMIT = 500;
export const ADMIN_ORDERS_LIST_DAYS = 90;

export function getAdminOrdersListSince(): string {
  const since = new Date();
  since.setDate(since.getDate() - ADMIN_ORDERS_LIST_DAYS);
  return since.toISOString();
}

export async function enrichAdminOrders(orders: Order[]): Promise<Order[]> {
  const b2bIds = orders
    .map((o) => o.b2b_customer_id)
    .filter((id): id is string => Boolean(id));

  const companyNames = await getB2BCompanyNames(b2bIds);

  return orders.map((order) => ({
    ...order,
    items: order.items ?? [],
    order_channel: order.order_channel ?? 'b2c',
    payment_status: order.payment_status ?? 'pending',
    b2b_company_name: order.b2b_customer_id
      ? (companyNames[order.b2b_customer_id] ?? null)
      : null,
  }));
}
