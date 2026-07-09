'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { applyClearancePricesToCartItems } from '@/lib/b2c/cart-pricing';
import { B2C_MIN_ORDER_TOTAL } from '@/lib/b2c/constants';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import {
  appendCancelNote,
  getAlmatyIsoFromDateAndTime,
  normalizeTimeInput,
} from '@/lib/order-admin';
import { makeFallbackOrderNumber } from '@/lib/order-numbers';
import { createClient, getAdminUser, tryCreateClient } from '@/lib/supabase/server';
import { isUuid } from '@/lib/utils';
import type { CartItem, CheckoutFormData, ClearanceRule, Locale, Order, OrderStatus } from '@/types';

interface CreateOrderResult {
  success: boolean;
  whatsappUrl?: string;
  error?: string;
}

export type OrderActionInput =
  | { orderId: string; action: 'confirm'; deliveryTime: string }
  | { orderId: string; action: 'ship'; shipTime: string }
  | { orderId: string; action: 'complete' }
  | { orderId: string; action: 'cancel'; reason: string };

export interface OrderActionResult {
  success: boolean;
  error?: string;
  migrationNeeded?: boolean;
  order?: Partial<Order>;
}

async function resolveCartItems(items: CartItem[]): Promise<CartItem[]> {
  const supabase = await tryCreateClient();
  if (!supabase) return items;

  const resolved: CartItem[] = [];

  for (const item of items) {
    if (isUuid(item.productId)) {
      resolved.push(item);
      continue;
    }

    const { data } = await supabase
      .from('products')
      .select('id')
      .eq('slug', item.slug)
      .maybeSingle();

    if (data?.id) {
      resolved.push({ ...item, productId: data.id });
    } else {
      resolved.push(item);
    }
  }

  return resolved;
}

async function resolveCartItemsWithPrices(items: CartItem[]): Promise<CartItem[]> {
  const resolved = await resolveCartItems(items);
  const supabase = await tryCreateClient();
  if (!supabase) return resolved;

  const slugs = [...new Set(resolved.map((i) => i.slug).filter(Boolean))];
  if (slugs.length === 0) return resolved;

  const [{ data: products }, { data: clearance }] = await Promise.all([
    supabase.from('products').select('slug, price').in('slug', slugs),
    supabase.from('storefront_clearance').select('*').eq('is_active', true),
  ]);

  const bySlug = new Map(
    (products ?? []).map((p) => [p.slug as string, { price: Number(p.price) }])
  );

  return applyClearancePricesToCartItems(
    resolved,
    bySlug,
    (clearance as ClearanceRule[]) ?? []
  );
}

async function checkStockIfAvailable(
  items: CartItem[]
): Promise<'insufficientStock' | null> {
  const supabase = await tryCreateClient();
  if (!supabase) return null;

  const uuidItems = items.filter((item) => isUuid(item.productId));
  if (uuidItems.length === 0) return null;

  const { error } = await supabase.rpc('check_order_stock', {
    order_items: uuidItems,
  });

  if (!error) return null;

  const message = error.message ?? '';

  if (
    message.includes('insufficient_stock') ||
    message.includes('product_unavailable')
  ) {
    return 'insufficientStock';
  }

  console.warn('Stock check skipped:', message);
  return null;
}

async function saveOrderToDatabase(
  formData: CheckoutFormData,
  items: CartItem[],
  locale: Locale,
  total: number,
  preferred?: { orderNumber?: string; orderPlacedAt?: string }
): Promise<{ orderNumber: string; orderPlacedAt: string; saved: boolean; error?: string }> {
  const orderPlacedAt = preferred?.orderPlacedAt ?? new Date().toISOString();
  const supabase = await tryCreateClient();
  if (!supabase) {
    return {
      orderNumber: preferred?.orderNumber ?? makeFallbackOrderNumber(),
      orderPlacedAt,
      saved: false,
      error: 'supabase_not_configured',
    };
  }

  let orderNumber = preferred?.orderNumber ?? makeFallbackOrderNumber();

  if (!preferred?.orderNumber) {
    const { data: orderNumberData, error: rpcError } = await supabase.rpc(
      'generate_order_number'
    );

    if (!rpcError && orderNumberData) {
      orderNumber = orderNumberData as string;
    }
  }

  const { error } = await supabase.from('orders').insert({
    order_number: orderNumber,
    customer_name: formData.customerName,
    phone: formData.phone,
    delivery_date: formData.deliveryDate,
    delivery_time: formData.deliveryTime,
    address: formData.address,
    cake_text: formData.cakeText ?? '',
    notes: formData.notes ?? '',
    items,
    total,
    locale,
    status: 'new',
    created_at: orderPlacedAt,
  });

  if (error) {
    console.error('Order insert error:', error);
    return { orderNumber, orderPlacedAt, saved: false, error: error.message };
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin');

  return { orderNumber, orderPlacedAt, saved: true };
}

function isMissingColumnError(message: string): boolean {
  return (
    message.includes('confirmed_at') ||
    message.includes('shipped_at') ||
    message.includes('completed_at') ||
    message.includes('cancelled_at') ||
    message.includes('cancel_reason') ||
    message.includes('schema cache')
  );
}

async function persistOrderUpdate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string,
  updates: Record<string, unknown>
): Promise<{ migrationNeeded: boolean }> {
  const { error } = await supabase.from('orders').update(updates).eq('id', orderId);

  if (!error) return { migrationNeeded: false };

  if (error.message.includes('invalid input value for enum')) {
    throw new Error('runOrderMigration');
  }

  if (!isMissingColumnError(error.message)) {
    throw new Error(error.message);
  }

  const attempts: Record<string, unknown>[] = [
    {
      status: updates.status,
      cancel_reason: updates.cancel_reason,
      notes: updates.notes,
      delivery_time: updates.delivery_time,
    },
    { status: updates.status, cancel_reason: updates.cancel_reason, notes: updates.notes },
    { status: updates.status, notes: updates.notes },
    { status: updates.status, cancel_reason: updates.cancel_reason },
    { status: updates.status, delivery_time: updates.delivery_time },
    { status: updates.status },
  ];

  for (const payload of attempts) {
    const clean = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
    );
    if (Object.keys(clean).length === 0) continue;

    const { error: retryError } = await supabase.from('orders').update(clean).eq('id', orderId);
    if (!retryError) return { migrationNeeded: true };

    if (retryError.message.includes('invalid input value for enum')) {
      throw new Error('runOrderMigration');
    }
  }

  throw new Error(error.message);
}

export async function createOrder(
  formData: CheckoutFormData,
  items: CartItem[],
  locale: Locale,
  options?: {
    orderNumber?: string;
    orderPlacedAt?: string;
    deliveryMethod?: 'delivery' | 'pickup';
  }
): Promise<CreateOrderResult> {
  if (items.length === 0) {
    return { success: false, error: 'cartEmpty' };
  }

  try {
    const resolvedItems = await resolveCartItemsWithPrices(items);
    const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    if (subtotal < B2C_MIN_ORDER_TOTAL) {
      return { success: false, error: 'minOrder' };
    }

    if (options?.deliveryMethod === 'delivery' && subtotal < B2C_MIN_ORDER_TOTAL) {
      return { success: false, error: 'deliveryNotAvailable' };
    }

    const stockError = await checkStockIfAvailable(resolvedItems);

    if (stockError) {
      return { success: false, error: stockError };
    }

    const total = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const { orderNumber, orderPlacedAt, saved, error: saveError } = await saveOrderToDatabase(
      formData,
      resolvedItems,
      locale,
      total,
      options
    );

    if (!saved) {
      return { success: false, error: 'saveFailed' };
    }

    const message = buildWhatsAppMessage({
      orderNumber,
      orderPlacedAt,
      customerName: formData.customerName,
      phone: formData.phone,
      deliveryDate: formData.deliveryDate,
      deliveryTime: formData.deliveryTime,
      address: formData.address,
      cakeText: formData.cakeText,
      notes: formData.notes,
      items: resolvedItems,
      total,
      locale,
    });

    return { success: true, whatsappUrl: buildWhatsAppUrl(message) };
  } catch (e) {
    console.error('createOrder failed:', e);
    return { success: false, error: 'generic' };
  }
}

export async function performOrderAction(input: OrderActionInput): Promise<OrderActionResult> {
  try {
    const supabase = await createClient();

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', input.orderId)
      .single();

    if (fetchError || !order) {
      return { success: false, error: fetchError?.message ?? 'Order not found' };
    }

    const currentStatus = order.status as OrderStatus;
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {};
    const patch: Partial<Order> = {};

    if (input.action === 'confirm') {
      if (currentStatus !== 'new') return { success: false, error: 'invalidTransition' };

      const deliveryTime = normalizeTimeInput(input.deliveryTime);
      if (!deliveryTime) return { success: false, error: 'invalidDeliveryTime' };

      updates.status = 'confirmed';
      updates.delivery_time = deliveryTime;
      updates.confirmed_at = now;
      patch.status = 'confirmed';
      patch.delivery_time = deliveryTime;
      patch.confirmed_at = now;
    }

    if (input.action === 'ship') {
      if (currentStatus !== 'confirmed') return { success: false, error: 'invalidTransition' };

      const shipTime = normalizeTimeInput(input.shipTime);
      if (!shipTime) return { success: false, error: 'invalidShipTime' };

      const shippedAt = getAlmatyIsoFromDateAndTime(order.delivery_date as string, shipTime);

      updates.status = 'shipped';
      updates.shipped_at = shippedAt;
      patch.status = 'shipped';
      patch.shipped_at = shippedAt;
    }

    if (input.action === 'complete') {
      if (currentStatus !== 'shipped') return { success: false, error: 'mustShipFirst' };

      updates.status = 'completed';
      updates.completed_at = now;
      patch.status = 'completed';
      patch.completed_at = now;
    }

    if (input.action === 'cancel') {
      if (currentStatus === 'completed' || currentStatus === 'cancelled') {
        return { success: false, error: 'invalidTransition' };
      }

      const reason = input.reason.trim();
      if (reason.length < 3) return { success: false, error: 'cancelReasonRequired' };

      const notesWithCancel = appendCancelNote((order.notes as string) ?? '', reason);

      updates.status = 'cancelled';
      updates.cancelled_at = now;
      updates.cancel_reason = reason;
      updates.notes = notesWithCancel;
      patch.status = 'cancelled';
      patch.cancelled_at = now;
      patch.cancel_reason = reason;
      patch.notes = notesWithCancel;
    }

    const wasDeducted = Boolean(order.stock_deducted);
    const isB2B = (order.order_channel as string | undefined) === 'b2b';

    if (input.action === 'confirm' && !wasDeducted && !isB2B) {
      const { error: stockError } = await supabase.rpc('fulfill_order_stock', {
        p_order_id: input.orderId,
      });
      if (stockError) {
        const message = stockError.message ?? '';
        if (message.includes('insufficient_stock') || message.includes('product_unavailable')) {
          return { success: false, error: 'insufficientStock' };
        }
        return { success: false, error: stockError.message };
      }
    }

    if (input.action === 'cancel' && wasDeducted && !isB2B) {
      const { error: restoreError } = await supabase.rpc('restore_order_stock', {
        p_order_id: input.orderId,
      });
      if (restoreError) return { success: false, error: restoreError.message };
    }

    const { migrationNeeded } = await persistOrderUpdate(supabase, input.orderId, updates);

    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/', 'layout');

    return { success: true, migrationNeeded, order: patch };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'generic';
    console.error('performOrderAction failed:', message);
    return { success: false, error: message };
  }
}

/** @deprecated use performOrderAction */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (status === 'confirmed') {
    return performOrderAction({ orderId, action: 'confirm', deliveryTime: '12:00' });
  }
  if (status === 'shipped') {
    return performOrderAction({ orderId, action: 'ship', shipTime: '12:00' });
  }
  if (status === 'completed') {
    return performOrderAction({ orderId, action: 'complete' });
  }
  if (status === 'cancelled') {
    return performOrderAction({ orderId, action: 'cancel', reason: 'İptal' });
  }
  throw new Error('invalidTransition');
}

export async function signInAdmin(email: string, password: string) {
  const supabase = await tryCreateClient();
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase ayarlı değil. .env.local dosyasını kontrol edin.',
    };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function clearOrderHistory(): Promise<
  { ok: true; deleted: number } | { ok: false; error: string }
> {
  const admin = await getAdminUser();
  if (!admin) {
    return { ok: false, error: 'Yetkisiz' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .delete()
    .in('status', ['completed', 'cancelled'])
    .select('id');

  if (error) {
    if (/policy|permission|denied/i.test(error.message)) {
      return {
        ok: false,
        error:
          'Silme yetkisi yok. Supabase SQL Editor\'de fix-pies-tarts-orders-kopyala.sql dosyasini calistirin.',
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
  return { ok: true, deleted: data?.length ?? 0 };
}

export async function signOutAdmin() {
  const supabase = await tryCreateClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect('/admin/login');
}
