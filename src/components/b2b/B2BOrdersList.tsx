'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatOrderDateTime } from '@/lib/order-dates';
import { formatPrice } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';

interface B2BOrdersListProps {
  orders: Order[];
}

function statusKey(status: OrderStatus): string {
  return `status.${status}`;
}

export function B2BOrdersList({ orders }: B2BOrdersListProps) {
  const t = useTranslations('b2b.orders');
  const [openId, setOpenId] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted">{t('empty')}</p>
        <Link href="/b2b/menu" className="btn-primary mt-6 inline-flex">
          {t('emptyCta')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const open = openId === order.id;
        const items = Array.isArray(order.items) ? order.items : [];
        const hasDiscount = Number(order.discount_percent) > 0 && order.subtotal != null;

        return (
          <article key={order.id} className="luxury-card overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : order.id)}
              className="flex w-full items-start justify-between gap-3 p-4 text-left"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display font-semibold">#{order.order_number}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      order.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {order.payment_status === 'paid' ? t('paid') : t('paymentPending')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {t('placed')}: {formatOrderDateTime(order.created_at)}
                </p>
                <p className="mt-0.5 text-sm">
                  {t(statusKey(order.status))}
                  {' · '}
                  {order.delivery_date}
                </p>
                <p className="mt-1 text-sm font-semibold text-accent">
                  {formatPrice(Number(order.total))}
                </p>
              </div>
              <ChevronDown
                className={`mt-1 h-5 w-5 shrink-0 text-muted transition-transform ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </button>

            {open ? (
              <div className="border-t border-border px-4 pb-4 pt-3 text-sm">
                <dl className="grid gap-2">
                  <div>
                    <dt className="text-muted">{t('deliveryAddress')}</dt>
                    <dd>{order.address}</dd>
                  </div>
                  {order.notes?.trim() ? (
                    <div>
                      <dt className="text-muted">{t('notes')}</dt>
                      <dd>{order.notes}</dd>
                    </div>
                  ) : null}
                </dl>

                <ul className="mt-3 space-y-1">
                  {items.map((item, i) => (
                    <li key={i} className="flex justify-between gap-3">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 space-y-1 border-t border-border pt-3">
                  {hasDiscount ? (
                    <>
                      <div className="flex justify-between text-muted">
                        <span>{t('subtotal')}</span>
                        <span>{formatPrice(Number(order.subtotal))}</span>
                      </div>
                      <div className="flex justify-between text-muted">
                        <span>{t('discount', { percent: order.discount_percent })}</span>
                        <span>
                          −{formatPrice(Number(order.subtotal) - Number(order.total))}
                        </span>
                      </div>
                    </>
                  ) : null}
                  <div className="flex justify-between font-semibold">
                    <span>{t('total')}</span>
                    <span className="text-accent">{formatPrice(Number(order.total))}</span>
                  </div>
                </div>

                {order.paid_at ? (
                  <p className="mt-2 text-xs text-green-700">
                    {t('paidAt')}: {formatOrderDateTime(order.paid_at)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
