'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Order } from '@/types';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import {
  ORDER_SECTIONS,
  countOrdersBySection,
  formatDeliverySchedule,
  getCancelReason,
  isOrderCreatedToday,
  sortOrdersForSection,
} from '@/lib/order-admin';
import { formatOrderDateTime, getTodayInStoreTimezone } from '@/lib/order-dates';
import { formatPrice } from '@/lib/utils';

interface AdminDashboardClientProps {
  orders: Order[];
  activeProducts: number;
}

export function AdminDashboardClient({ orders, activeProducts }: AdminDashboardClientProps) {
  const [logOpen, setLogOpen] = useState(true);
  const today = getTodayInStoreTimezone();

  const todayOrders = orders.filter(isOrderCreatedToday);
  const todaySorted = [...todayOrders].sort((a, b) => b.created_at.localeCompare(a.created_at));

  const stats = [
    { label: 'Bugün gelen sipariş', value: todayOrders.length },
    { label: 'Yeni (onay bekliyor)', value: countOrdersBySection(orders, 'new') },
    { label: 'Sevkiyat bekleyen', value: countOrdersBySection(orders, 'confirmed') },
    { label: 'Aktif ürün', value: activeProducts },
  ];

  const todayDeliveries = sortOrdersForSection(
    orders.filter(
      (o) =>
        o.delivery_date.slice(0, 10) === today &&
        (o.status === 'confirmed' || o.status === 'shipped')
    ),
    'confirmed'
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted">Günlük sipariş özeti — {today}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="luxury-card p-5">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="font-display mt-1 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {ORDER_SECTIONS.map((section) => {
          const count = countOrdersBySection(orders, section.key);
          return (
            <Link
              key={section.key}
              href="/admin/orders"
              className="chip shrink-0 hover:bg-brand/20"
            >
              {section.label}: {count}
            </Link>
          );
        })}
      </div>

      <section className="mt-10">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
          onClick={() => setLogOpen((v) => !v)}
        >
          <h2 className="font-display text-xl font-semibold">Günlük kayıt ({today})</h2>
          <span className="text-sm text-muted">{logOpen ? 'Gizle ▲' : 'Göster ▼'}</span>
        </button>

        {logOpen ? (
          <div className="mt-4 space-y-2">
            {todaySorted.length === 0 ? (
              <p className="text-muted">Bugün kayıt yok.</p>
            ) : (
              todaySorted.map((order) => (
                <div
                  key={order.id}
                  className="luxury-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      #{order.order_number} · {order.customer_name}
                    </p>
                    <p className="text-sm text-muted">
                      Sipariş: {formatOrderDateTime(order.created_at)}
                    </p>
                    <p className="text-sm">{formatDeliverySchedule(order)}</p>
                    {getCancelReason(order) ? (
                      <p className="text-sm text-red-700">İptal: {getCancelReason(order)}</p>
                    ) : null}
                  </div>
                  <div className="text-left sm:text-right">
                    <OrderStatusBadge status={order.status} />
                    <p className="mt-1 text-sm font-semibold">{formatPrice(Number(order.total))}</p>
                    <Link href="/admin/orders" className="mt-1 inline-block text-sm text-accent underline">
                      Siparişler →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">Bugün teslim edilecekler</h2>
        <div className="mt-4 space-y-2">
          {todayDeliveries.length === 0 ? (
            <p className="text-muted">Bugün teslimat yok.</p>
          ) : (
            todayDeliveries.map((order) => (
              <div key={order.id} className="luxury-card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">#{order.order_number}</p>
                  <p className="text-sm text-muted">{order.customer_name}</p>
                  <p className="text-sm font-medium">{formatDeliverySchedule(order)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
