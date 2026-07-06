import type { Order } from '@/types';
import { isB2BOrder } from '@/lib/b2b/order-filter';

export function OrderChannelBadge({ order }: { order: Order }) {
  if (!isB2BOrder(order)) {
    return (
      <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        B2C
      </span>
    );
  }

  return (
    <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
      B2B
    </span>
  );
}

export function B2BPaymentBadge({ order }: { order: Order }) {
  if (!isB2BOrder(order)) return null;

  const paid = order.payment_status === 'paid';

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        paid ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'
      }`}
    >
      {paid ? 'Ödendi' : 'Ödeme bekliyor'}
    </span>
  );
}
