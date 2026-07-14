'use server';

import { revalidatePath } from 'next/cache';
import {
  getB2BPendingDeliveryTime,
  isDeliveryDateValid,
  needsB2BDeliveryDateApproval,
} from '@/lib/checkout';
import { getB2BCustomerSession } from '@/lib/b2b/customer';
import { B2B_MIN_ORDER_TOTAL } from '@/lib/b2b/constants';
import { calculateB2BTotals } from '@/lib/b2b/pricing';
import { resolveB2BCartItems } from '@/lib/b2b/resolve-prices';
import { buildB2BWhatsAppMessage } from '@/lib/b2b/whatsapp';
import { getB2BWhatsAppLink } from '@/lib/b2b/whatsapp-link';
import { makeFallbackOrderNumber } from '@/lib/order-numbers';
import { isValidB2BPhone, normalizeB2BPhone } from '@/lib/b2b/phone';
import { tryCreateClient } from '@/lib/supabase/server';
import { tryCreateServiceClient } from '@/lib/supabase/service';
import type { CartItem, Locale } from '@/types';

export interface B2BCheckoutInput {
  contactName: string;
  phone: string;
  deliveryDate: string;
  branchId: string;
  notes: string;
}

interface CreateB2BOrderResult {
  success: boolean;
  whatsappUrl?: string;
  whatsappMessage?: string;
  error?: string;
}

export async function createB2BOrder(
  input: B2BCheckoutInput,
  items: CartItem[],
  locale: Locale,
  options?: { orderNumber?: string; orderPlacedAt?: string }
): Promise<CreateB2BOrderResult> {
  const customer = await getB2BCustomerSession();
  if (!customer) {
    return { success: false, error: 'unauthorized' };
  }

  if (items.length === 0) {
    return { success: false, error: 'cartEmpty' };
  }

  const contactName = input.contactName.trim();
  if (contactName.length < 2) {
    return { success: false, error: 'nameRequired' };
  }

  const normalizedPhone = normalizeB2BPhone(input.phone);
  if (!isValidB2BPhone(normalizedPhone)) {
    return { success: false, error: 'invalidPhone' };
  }

  if (!isDeliveryDateValid(input.deliveryDate)) {
    return { success: false, error: 'invalidDate' };
  }

  const branch = customer.branches.find((b) => b.id === input.branchId);
  if (!branch) {
    return { success: false, error: 'invalidBranch' };
  }

  const { items: resolvedItems, error: priceError } = await resolveB2BCartItems(items);
  if (priceError) {
    return { success: false, error: priceError };
  }

  const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (subtotal < B2B_MIN_ORDER_TOTAL) {
    return { success: false, error: 'minOrder' };
  }

  const discountPercent = customer.discount_tier;
  const { discountAmount, total } = calculateB2BTotals(subtotal, discountPercent);

  const orderPlacedAt = options?.orderPlacedAt ?? new Date().toISOString();
  let orderNumber = options?.orderNumber ?? makeFallbackOrderNumber(new Date(orderPlacedAt));

  const orderPlacedDate = new Date(orderPlacedAt);
  const dateNeedsApproval = needsB2BDeliveryDateApproval(
    input.deliveryDate,
    orderPlacedDate
  );
  const deliveryTime = getB2BPendingDeliveryTime(locale, dateNeedsApproval);
  const address = `${branch.branch_name}: ${branch.address}`;
  const notes = input.notes.trim();
  const phoneE164 = `+${normalizedPhone}`;

  const supabase = (await tryCreateClient()) ?? tryCreateServiceClient();
  if (!supabase) {
    return { success: false, error: 'setup' };
  }

  if (!options?.orderNumber) {
    const { data: orderNumberData, error: rpcError } = await supabase.rpc('generate_order_number');
    if (!rpcError && orderNumberData) {
      orderNumber = orderNumberData as string;
    }
  }

  const orderRow: Record<string, unknown> = {
    order_number: orderNumber,
    customer_name: contactName,
    phone: phoneE164,
    delivery_date: input.deliveryDate,
    delivery_time: deliveryTime,
    address,
    cake_text: '',
    notes,
    items: resolvedItems,
    total,
    locale,
    status: 'new',
    created_at: orderPlacedAt,
    order_channel: 'b2b',
    b2b_customer_id: customer.id,
    b2b_branch_id: branch.id,
    discount_percent: discountPercent,
    subtotal,
    payment_status: 'pending',
  };

  const { error: insertError } = await supabase.from('orders').insert(orderRow);

  if (insertError) {
    const fallbackRow = { ...orderRow };
    delete fallbackRow.order_channel;
    delete fallbackRow.b2b_customer_id;
    delete fallbackRow.b2b_branch_id;
    delete fallbackRow.discount_percent;
    delete fallbackRow.subtotal;
    delete fallbackRow.payment_status;

    const { error: fallbackError } = await supabase.from('orders').insert(fallbackRow);
    if (fallbackError) {
      console.error('createB2BOrder insert:', insertError.message, fallbackError.message);
      return { success: false, error: 'saveFailed' };
    }
  }

  revalidatePath('/admin/orders');
  revalidatePath('/admin');

  const message = buildB2BWhatsAppMessage({
    orderNumber,
    orderPlacedAt,
    companyName: customer.company_name,
    inn: customer.inn,
    directorName: customer.director_name,
    contactName,
    phone: phoneE164,
    phoneAlt: customer.phone_alt ? `+${customer.phone_alt}` : undefined,
    branchName: branch.branch_name,
    deliveryDate: input.deliveryDate,
    deliveryTime,
    address: branch.address,
    notes,
    items: resolvedItems,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    locale,
    deliveryDateNeedsApproval: dateNeedsApproval,
  });

  return { success: true, whatsappUrl: getB2BWhatsAppLink(message), whatsappMessage: message };
}
