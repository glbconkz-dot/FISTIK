'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { clearOrderHistory } from '@/app/actions/orders';
import type { Order } from '@/types';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderChannelBadge, B2BPaymentBadge } from '@/components/admin/OrderChannelBadge';
import { OrderDetailPanel } from '@/components/admin/OrderDetailPanel';
import {
  ORDER_SECTIONS,
  filterOrdersBySection,
  formatDeliverySchedule,
  getCancelReason,
  sortOrdersForSection,
  type OrderSection,
} from '@/lib/order-admin';
import {
  filterOrdersByChannel,
  isB2BOrder,
  type OrderChannelFilter,
} from '@/lib/b2b/order-filter';
import { formatOrderDateTime } from '@/lib/order-dates';
import { formatPrice } from '@/lib/utils';

interface OrdersListProps {
  orders: Order[];
}

export function OrdersList({ orders: initialOrders }: OrdersListProps) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [section, setSection] = useState<OrderSection>('new');
  const [channel, setChannel] = useState<OrderChannelFilter>('all');
  const [clearError, setClearError] = useState<string | null>(null);
  const [isClearing, startClearTransition] = useTransition();

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const channelOrders = useMemo(
    () => filterOrdersByChannel(orders, channel),
    [orders, channel]
  );

  const historyCount = useMemo(
    () =>
      channelOrders.filter((o) => o.status === 'completed' || o.status === 'cancelled').length,
    [channelOrders]
  );

  const filtered = useMemo(() => {
    const list = filterOrdersBySection(channelOrders, section);
    return sortOrdersForSection(list, section);
  }, [channelOrders, section]);

  const b2bCount = useMemo(() => orders.filter(isB2BOrder).length, [orders]);
  const b2cCount = orders.length - b2bCount;

  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const activeSection = ORDER_SECTIONS.find((s) => s.key === section);

  const handleOrderChange = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
  };

  const handleClearHistory = () => {
    if (
      !window.confirm(
        'Tamamlanan ve iptal edilen tüm siparişler kalıcı olarak silinsin mi? Yeni ve onaylı siparişler kalır.'
      )
    ) {
      return;
    }

    setClearError(null);
    startClearTransition(async () => {
      const result = await clearOrderHistory();
      if (!result.ok) {
        setClearError(result.error);
        return;
      }
      setOrders((prev) => prev.filter((o) => o.status !== 'completed' && o.status !== 'cancelled'));
      setSelectedId(null);
      if (section === 'completed' || section === 'cancelled') {
        setSection('new');
      }
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        {historyCount > 0 ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-cream/50 px-3 py-2.5">
            <p className="text-xs text-muted">
              Geçmiş: {historyCount} sipariş (teslim + iptal)
            </p>
            <button
              type="button"
              disabled={isClearing}
              onClick={handleClearHistory}
              className="btn-outline border-red-300 px-3 py-1.5 text-xs text-red-700"
            >
              {isClearing ? 'Siliniyor…' : 'Geçmişi temizle'}
            </button>
          </div>
        ) : null}

        {clearError ? (
          <div className="mb-3 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {clearError}
          </div>
        ) : null}

        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {(
            [
              { key: 'all' as const, label: 'Tümü', count: orders.length },
              { key: 'b2c' as const, label: 'B2C', count: b2cCount },
              { key: 'b2b' as const, label: 'B2B', count: b2bCount },
            ] as const
          ).map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setChannel(key);
                setSelectedId(null);
              }}
              className={`chip shrink-0 ${channel === key ? 'chip-active' : ''}`}
            >
              {label}
              {count > 0 ? ` (${count})` : ''}
            </button>
          ))}
        </div>

        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {ORDER_SECTIONS.map((s) => {
            const count = filterOrdersBySection(channelOrders, s.key).length;
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
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <OrderChannelBadge order={order} />
                  <B2BPaymentBadge order={order} />
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
              <p className="mt-1 text-sm font-medium">{order.customer_name}</p>
              {isB2BOrder(order) && order.b2b_company_name ? (
                <p className="text-xs text-muted">{order.b2b_company_name}</p>
              ) : null}
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
