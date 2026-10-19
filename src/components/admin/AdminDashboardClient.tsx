'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Order } from '@/types';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import {
  ORDER_SECTION_KEYS,
  countOrdersBySection,
  filterOrdersCancelledOnDate,
  filterOrdersCompletedOnDate,
  filterOrdersCreatedOnDate,
  formatDeliverySchedule,
  getCancelReason,
  getOrderSectionLabel,
  shiftStoreDate,
} from '@/lib/order-admin';
import { getTodayInStoreTimezone } from '@/lib/order-dates';
import { formatPrice } from '@/lib/utils';

interface AdminDashboardClientProps {
  orders: Order[];
  activeProducts: number;
}

function DailyLogSection({
  title,
  orders,
  emptyText,
  todayLabel,
  reasonLabel,
}: {
  title: string;
  orders: Order[];
  emptyText: string;
  todayLabel: string;
  reasonLabel: string;
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
                <p className="text-sm text-muted">
                  {formatDeliverySchedule(order, todayLabel)}
                </p>
                {getCancelReason(order) ? (
                  <p className="text-sm text-red-700">
                    {reasonLabel} {getCancelReason(order)}
                  </p>
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
  const { t } = useAdminLocale();
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
      label: isToday ? t('dashStatOrdersToday') : t('dashStatOrdersDay'),
      value: createdOnDay.length,
    },
    { label: t('dashStatNew'), value: countOrdersBySection(orders, 'new') },
    { label: t('dashStatConfirmed'), value: countOrdersBySection(orders, 'confirmed') },
    { label: t('dashStatActiveProducts'), value: activeProducts },
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
      <h1 className="font-display text-3xl font-bold">{t('dashTitle')}</h1>
      <p className="mt-1 text-muted">{t('dashSubtitle')}</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-outline px-3 py-2 text-sm"
          onClick={() => setSelectedDate((d) => shiftStoreDate(d, -1))}
        >
          {t('dashPrevDay')}
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
          {t('dashNextDay')}
        </button>
        {!isToday ? (
          <button
            type="button"
            className="chip"
            onClick={() => setSelectedDate(today)}
          >
            {t('ordersToday')}
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

      <div className="mt-6 flex flex-wrap gap-2">
        {ORDER_SECTION_KEYS.map((key) => {
          const count = countOrdersBySection(orders, key);
          return (
            <Link
              key={key}
              href="/admin/orders"
              className="chip shrink-0 hover:bg-brand/20"
            >
              {getOrderSectionLabel(key, t)}: {count}
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
          <h2 className="font-display text-xl font-semibold">
            {t('dashDailyLog')} — {selectedDate}
          </h2>
          <span className="text-sm text-muted">{logOpen ? t('dashHide') : t('dashShow')}</span>
        </button>

        {logOpen ? (
          <div className="mt-4 space-y-6">
            <DailyLogSection
              title={`${t('dashIncoming')} (${createdOnDay.length})`}
              orders={createdOnDay}
              emptyText={t('dashIncomingEmpty')}
              todayLabel={t('ordersToday')}
              reasonLabel={t('ordersLabelReason')}
            />
            <DailyLogSection
              title={`${t('dashCompleted')} (${completedOnDay.length})`}
              orders={completedOnDay}
              emptyText={t('dashCompletedEmpty')}
              todayLabel={t('ordersToday')}
              reasonLabel={t('ordersLabelReason')}
            />
            <DailyLogSection
              title={`${t('dashCancelled')} (${cancelledOnDay.length})`}
              orders={cancelledOnDay}
              emptyText={t('dashCancelledEmpty')}
              todayLabel={t('ordersToday')}
              reasonLabel={t('ordersLabelReason')}
            />
            <Link href="/admin/orders" className="inline-block text-sm text-accent underline">
              {t('orders')} →
            </Link>
          </div>
        ) : null}
      </section>

      {isToday ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold">{t('dashTodayDeliveries')}</h2>
          <div className="mt-4 space-y-2">
            {todayDeliveries.length === 0 ? (
              <p className="text-muted">{t('dashTodayDeliveriesEmpty')}</p>
            ) : (
              todayDeliveries.map((order) => (
                <div key={order.id} className="luxury-card flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">#{order.order_number}</p>
                    <p className="text-sm text-muted">{order.customer_name}</p>
                    <p className="text-sm font-medium">
                      {formatDeliverySchedule(order, t('ordersToday'))}
                    </p>
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
