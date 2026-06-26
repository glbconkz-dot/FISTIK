'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Order } from '@/types';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderDetailPanel } from '@/components/admin/OrderDetailPanel';
import {
  ORDER_SECTIONS,
  filterOrdersBySection,
  formatDeliverySchedule,
  getCancelReason,
  sortOrdersForSection,
  type OrderSection,
} from '@/lib/order-admin';
import { formatOrderDateTime } from '@/lib/order-dates';
import { formatPrice } from '@/lib/utils';

interface OrdersListProps {
  orders: Order[];
}

export function OrdersList({ orders: initialOrders }: OrdersListProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [section, setSection] = useState<OrderSection>('new');

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const filtered = useMemo(() => {
    const list = filterOrdersBySection(orders, section);
    return sortOrdersForSection(list, section);
  }, [orders, section]);

  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const activeSection = ORDER_SECTIONS.find((s) => s.key === section);

  const handleOrderChange = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
    if (updated.status !== section) {
      setSection(updated.status);
      setSelectedId(updated.id);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {ORDER_SECTIONS.map((s) => {
            const count = filterOrdersBySection(orders, s.key).length;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => {
                  setSection(s.key);
                  setSelectedId(null);
                }}
                className={`chip shrink-0 ${section === s.key ? 'chip-active' : ''}`}
              >
                {s.label}
                {count > 0 ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>

        {activeSection ? (
          <p className="mb-3 text-xs text-muted">{activeSection.hint}</p>
        ) : null}

        <div className="space-y-2">
          {filtered.map((order) => {
            const cancelReason = getCancelReason(order);
            return (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelectedId(order.id)}
              className={`luxury-card w-full p-4 text-left transition-colors ${
                selectedId === order.id ? 'ring-2 ring-accent' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">#{order.order_number}</span>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-sm font-medium">{order.customer_name}</p>
              <p className="text-sm text-muted">
                Sipariş: {formatOrderDateTime(order.created_at)}
              </p>
              {section !== 'new' && section !== 'cancelled' ? (
                <p className="text-sm font-medium text-accent">
                  {formatDeliverySchedule(order)}
                </p>
              ) : null}
              {order.shipped_at && section === 'shipped' ? (
                <p className="text-sm text-sky-800">
                  Sevk: {formatOrderDateTime(order.shipped_at)}
                </p>
              ) : null}
              {order.confirmed_at && section === 'confirmed' ? (
                <p className="text-sm text-amber-800">
                  Onay: {formatOrderDateTime(order.confirmed_at)}
                </p>
              ) : null}
              {order.completed_at && section === 'completed' ? (
                <p className="text-sm text-green-800">
                  Teslim: {formatOrderDateTime(order.completed_at)}
                </p>
              ) : null}
              {cancelReason && section === 'cancelled' ? (
                <p className="text-sm font-medium text-red-700 line-clamp-3">
                  Neden: {cancelReason}
                </p>
              ) : null}
              <p className="mt-1 text-sm font-semibold">{formatPrice(Number(order.total))}</p>
            </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-muted">Bu bölümde sipariş yok.</p>
          )}
        </div>
      </div>

      <div className="lg:sticky lg:top-4 lg:self-start">
        {selected ? (
          <OrderDetailPanel order={selected} onOrderChange={handleOrderChange} />
        ) : (
          <div className="luxury-card flex min-h-48 items-center justify-center p-6 text-center text-muted">
            Soldan bir sipariş seçin
          </div>
        )}
      </div>
    </div>
  );
}
