'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Order } from '@/types';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import {
  ORDER_SECTIONS,
  countOrdersBySection,
  filterOrdersCancelledOnDate,
  filterOrdersCompletedOnDate,
  filterOrdersCreatedOnDate,
  formatDeliverySchedule,
  getCancelReason,
  shiftStoreDate,
} from '@/lib/order-admin';
import { getTodayInStoreTimezone } from '@/lib/order-dates';
import { cn, formatPrice } from '@/lib/utils';

interface AdminDashboardClientProps {
  orders: Order[];
  activeProducts: number;
}

function DailyLogSection({
  title,
  orders,
  emptyText,
}: {
  title: string;
  orders: Order[];
  emptyText: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted">{title}</h3>
      <div className="mt-2 space-y-2">
        {orders.length === 0 ? (
          <p className="text-sm text-muted">{emptyText}</p>
        ) : (
          orders.map((order) => (
            <div
              key={`${title}-${order.id}`}
              className="luxury-card flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">
                  #{order.order_number} · {order.customer_name}
                </p>
                <p className="text-sm text-muted">{formatDeliverySchedule(order)}</p>
                {getCancelReason(order) ? (
                  <p className="text-sm text-red-700">İptal: {getCancelReason(order)}</p>
                ) : null}
              </div>
              <div className="text-left sm:text-right">
                <OrderStatusBadge status={order.status} />
                <p className="mt-1 text-sm font-semibold">{formatPrice(Number(order.total))}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AdminDashboardClient({ orders, activeProducts }: AdminDashboardClientProps) {
  const today = getTodayInStoreTimezone();
  const [selectedDate, setSelectedDate] = useState(today);
  const [logOpen, setLogOpen] = useState(true);

  const isToday = selectedDate === today;

  const createdOnDay = filterOrdersCreatedOnDate(orders, selectedDate).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  const completedOnDay = filterOrdersCompletedOnDate(orders, selectedDate);
  const cancelledOnDay = filterOrdersCancelledOnDate(orders, selectedDate);

  const stats = [
    {
      label: isToday ? 'Bugün gelen sipariş' : 'Gelen sipariş',
      value: createdOnDay.length,
    },
    { label: 'Yeni (onay bekliyor)', value: countOrdersBySection(orders, 'new') },
    { label: 'Sevkiyat bekleyen', value: countOrdersBySection(orders, 'confirmed') },
    { label: 'Aktif ürün', value: activeProducts },
  ];

  const todayDeliveries = orders
    .filter(
      (o) =>
        o.delivery_date.slice(0, 10) === today &&
        (o.status === 'confirmed' || o.status === 'shipped')
    )
    .sort((a, b) => a.delivery_time.localeCompare(b.delivery_time));

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-muted">Günlük sipariş kayıtları</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-outline px-3 py-2 text-sm"
          onClick={() => setSelectedDate((d) => shiftStoreDate(d, -1))}
        >
          ← Önceki gün
        </button>
        <input
          type="date"
          className="input-field w-auto max-w-[11rem]"
          value={selectedDate}
          max={today}
          onChange={(e) => {
            if (e.target.value) setSelectedDate(e.target.value);
          }}
        />
        <button
          type="button"
          className="btn-outline px-3 py-2 text-sm disabled:opacity-40"
          disabled={isToday}
          onClick={() => setSelectedDate((d) => shiftStoreDate(d, 1))}
        >
          Sonraki gün →
        </button>
        {!isToday ? (
          <button
            type="button"
            className="chip"
            onClick={() => setSelectedDate(today)}
          >
            Bugün
          </button>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="luxury-card p-5">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="font-display mt-1 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-cream/40 p-2">
        <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
          Siparişler
        </p>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
          {ORDER_SECTIONS.map((section) => {
            const count = countOrdersBySection(orders, section.key);
            return (
              <Link
                key={section.key}
                href="/admin/orders"
                title={section.label}
                className={cn(
                  'flex min-h-[36px] items-center justify-center gap-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-xs font-medium leading-tight text-muted transition-colors hover:bg-border/50 hover:text-foreground'
                )}
              >
                <span className="truncate">{section.shortLabel}</span>
                {count > 0 ? (
                  <span className="shrink-0 tabular-nums opacity-80">({count})</span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>

      <section className="mt-10">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
          onClick={() => setLogOpen((v) => !v)}
        >
          <h2 className="font-display text-xl font-semibold">Günlük kayıt — {selectedDate}</h2>
          <span className="text-sm text-muted">{logOpen ? 'Gizle ▲' : 'Göster ▼'}</span>
        </button>

        {logOpen ? (
          <div className="mt-4 space-y-6">
            <DailyLogSection
              title={`Gelen siparişler (${createdOnDay.length})`}
              orders={createdOnDay}
              emptyText="Bu gün sipariş yok."
            />
            <DailyLogSection
              title={`Teslim edilenler (${completedOnDay.length})`}
              orders={completedOnDay}
              emptyText="Bu gün tamamlanan sipariş yok."
            />
            <DailyLogSection
              title={`İptal edilenler (${cancelledOnDay.length})`}
              orders={cancelledOnDay}
              emptyText="Bu gün iptal yok."
            />
            <Link href="/admin/orders" className="inline-block text-sm text-accent underline">
              Tüm siparişler →
            </Link>
          </div>
        ) : null}
      </section>

      {isToday ? (
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
      ) : null}
    </div>
  );
}
