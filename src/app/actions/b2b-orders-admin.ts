'use server';

import { revalidatePath } from 'next/cache';
import { getAdminUser, createClient } from '@/lib/supabase/server';
import { recordB2BPayment, reverseB2BPayment } from '@/lib/b2b/monthly-stats';
import { isB2BOrder } from '@/lib/b2b/order-filter';
import type { B2BPaymentStatus, Order } from '@/types';

interface PaymentResult {
  success: boolean;
  error?: string;
  order?: Partial<Order>;
}

export async function setB2BOrderPaymentStatus(
  orderId: string,
  status: B2BPaymentStatus
): Promise<PaymentResult> {
  const admin = await getAdminUser();
  if (!admin) {
    return { success: false, error: 'unauthorized' };
  }

  const supabase = await createClient();
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select(
      'id, order_channel, b2b_customer_id, total, payment_status, paid_at'
    )
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return { success: false, error: 'notFound' };
  }

  if (!isB2BOrder(order as Order) || !order.b2b_customer_id) {
    return { success: false, error: 'notB2B' };
  }

  const now = new Date().toISOString();
  const wasPaid = order.payment_status === 'paid';
  const amount = Number(order.total);

  if (status === 'paid') {
    if (wasPaid) {
      return {
        success: true,
        order: { payment_status: 'paid', paid_at: order.paid_at },
      };
    }

    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', paid_at: now })
      .eq('id', orderId);

    if (error) {
      console.error('setB2BOrderPaymentStatus paid:', error.message);
      return { success: false, error: 'saveFailed' };
    }

    const statsOk = await recordB2BPayment(order.b2b_customer_id, amount, now);

    if (!statsOk) {
      return { success: false, error: 'statsFailed' };
    }

    revalidatePath('/admin/orders');
    revalidatePath('/admin/b2b/reports');
    return { success: true, order: { payment_status: 'paid', paid_at: now } };
  }

  if (!wasPaid) {
    return {
      success: true,
      order: { payment_status: 'pending', paid_at: null },
    };
  }

  const paidAt = (order.paid_at as string) ?? now;

  const { error } = await supabase
    .from('orders')
    .update({ payment_status: 'pending', paid_at: null })
    .eq('id', orderId);

  if (error) {
    console.error('setB2BOrderPaymentStatus pending:', error.message);
    return { success: false, error: 'saveFailed' };
  }

  const statsOk = await reverseB2BPayment(order.b2b_customer_id, amount, paidAt);

  if (!statsOk) {
    return { success: false, error: 'statsFailed' };
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin/b2b/reports');
  return { success: true, order: { payment_status: 'pending', paid_at: null } };
}
