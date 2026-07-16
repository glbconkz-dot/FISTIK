'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { clearOrderHistory } from '@/app/actions/orders';
import type { Order } from '@/types';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { OrderChannelBadge, B2BPaymentBadge } from '@/components/admin/OrderChannelBadge';
import { OrderDetailPanel } from '@/components/admin/OrderDetailPanel';
import { LiveOrderMonitor } from '@/components/admin/LiveOrderMonitor';
import {
  readLiveOrdersEnabled,
  useLiveOrders,
  writeLiveOrdersEnabled,
} from '@/hooks/use-live-orders';
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
import { cn, formatPrice } from '@/lib/utils';

interface OrdersListProps {
  orders: Order[];
}

function FilterButton({
  active,
  label,
  count,
  onClick,
  title,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'flex min-h-[36px] items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium leading-tight transition-colors touch-manipulation',
        active
          ? 'bg-foreground text-background'
          : 'border border-border bg-surface text-muted hover:bg-border/50 hover:text-foreground'
      )}
    >
      <span className="truncate">{label}</span>
      {count > 0 ? <span className="shrink-0 tabular-nums opacity-80">({count})</span> : null}
    </button>
  );
}

export function OrdersList({ orders: initialOrders }: OrdersListProps) {
  const router = useRouter();
  const [liveEnabled, setLiveEnabled] = useState(true);
  const {
    orders,
    setOrders,
    syncedAt,
    syncError,
    newArrivalCount,
    clearNewArrivals,
    refreshNow,
  } = useLiveOrders(initialOrders, liveEnabled);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [section, setSection] = useState<OrderSection>('new');
  const [channel, setChannel] = useState<OrderChannelFilter>('all');
  const [clearError, setClearError] = useState<string | null>(null);
  const [isClearing, startClearTransition] = useTransition();

  useEffect(() => {
    setLiveEnabled(readLiveOrdersEnabled());
  }, []);

  const handleLiveToggle = (enabled: boolean) => {
    setLiveEnabled(enabled);
    writeLiveOrdersEnabled(enabled);
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedId(orderId);
    clearNewArrivals();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSection(order.status);
    }
  };

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
  const pendingNewOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'new')
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 8),
    [orders]
  );

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
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="order-2 xl:order-1">
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

        <div className="mb-3 rounded-xl border border-border bg-cream/40 p-2">
          <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            Kanal
          </p>
          <div className="grid grid-cols-3 gap-1">
            {(
              [
                { key: 'all' as const, label: 'Tümü', count: orders.length },
                { key: 'b2c' as const, label: 'B2C', count: b2cCount },
                { key: 'b2b' as const, label: 'B2B', count: b2bCount },
              ] as const
            ).map(({ key, label, count }) => (
              <FilterButton
                key={key}
                active={channel === key}
                label={label}
                count={count}
                onClick={() => {
                  setChannel(key);
                  setSelectedId(null);
                }}
              />
            ))}
          </div>

          <p className="mb-1 mt-2.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            Durum
          </p>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
            {ORDER_SECTIONS.map((s) => {
              const count = filterOrdersBySection(channelOrders, s.key).length;
              return (
                <FilterButton
                  key={s.key}
                  active={section === s.key}
                  label={s.shortLabel}
                  title={s.label}
                  count={count}
                  onClick={() => {
                    setSection(s.key);
                    setSelectedId(null);
                  }}
                />
              );
            })}
          </div>

          {activeSection ? (
            <p className="mt-2 border-t border-border/60 px-1 pt-2 text-[11px] leading-snug text-muted">
              <span className="font-medium text-foreground">{activeSection.label}:</span>{' '}
              {activeSection.hint}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          {filtered.map((order) => {
            const cancelReason = getCancelReason(order);
            return (
            <button
              key={order.id}
              type="button"
              onClick={() => handleSelectOrder(order.id)}
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

      <div className="order-1 space-y-3 xl:order-2 xl:sticky xl:top-4 xl:self-start">
        <LiveOrderMonitor
          enabled={liveEnabled}
          onToggle={handleLiveToggle}
          syncedAt={syncedAt}
          syncError={syncError}
          newArrivalCount={newArrivalCount}
          newOrders={pendingNewOrders}
          onSelectOrder={handleSelectOrder}
          onRefresh={() => void refreshNow()}
          selectedId={selectedId}
        />
        {selected ? (
          <OrderDetailPanel order={selected} onOrderChange={handleOrderChange} />
        ) : (
          <div className="luxury-card flex min-h-40 items-center justify-center p-6 text-center text-sm text-muted">
            Soldan veya yukarıdaki canlı listeden bir sipariş seçin
          </div>
        )}
      </div>
    </div>
  );
}
