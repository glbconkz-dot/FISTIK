'use client';

import type { Order } from '@/types';
import { OrderChannelBadge } from '@/components/admin/OrderChannelBadge';
import { formatOrderDateTime } from '@/lib/order-dates';
import { cn, formatPrice } from '@/lib/utils';

interface LiveOrderMonitorProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  syncedAt: Date | null;
  syncError: string | null;
  newArrivalCount: number;
  newOrders: Order[];
  onSelectOrder: (orderId: string) => void;
  onRefresh: () => void;
  selectedId: string | null;
}

function formatSyncTime(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function LiveOrderMonitor({
  enabled,
  onToggle,
  syncedAt,
  syncError,
  newArrivalCount,
  newOrders,
  onSelectOrder,
  onRefresh,
  selectedId,
}: LiveOrderMonitorProps) {
  return (
    <div
      className={cn(
        'luxury-card overflow-hidden border-2 transition-colors',
        enabled ? 'border-green-400/60 bg-green-50/30' : 'border-border'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-block h-2.5 w-2.5 rounded-full',
              enabled ? 'animate-pulse bg-green-500' : 'bg-muted'
            )}
            aria-hidden
          />
          <h2 className="font-display text-sm font-semibold">Canlı izleme</h2>
          {enabled ? (
            <span className="rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Aktif
            </span>
          ) : (
            <span className="rounded-full bg-muted/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
              Kapalı
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="btn-outline px-2 py-1 text-xs"
            disabled={!enabled}
          >
            Yenile
          </button>
          <button
            type="button"
            onClick={() => onToggle(!enabled)}
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-medium',
              enabled
                ? 'bg-foreground text-background'
                : 'border border-border bg-surface text-muted'
            )}
          >
            {enabled ? 'Durdur' : 'Başlat'}
          </button>
        </div>
      </div>

      <div className="space-y-2 px-4 py-3 text-xs text-muted">
        <p>
          Son güncelleme: <span className="font-medium text-foreground">{formatSyncTime(syncedAt)}</span>
          {enabled ? ' · her 12 sn' : null}
        </p>
        {syncError ? <p className="text-red-600">{syncError}</p> : null}
        {newArrivalCount > 0 ? (
          <p className="font-medium text-green-800">
            +{newArrivalCount} yeni sipariş geldi
          </p>
        ) : enabled ? (
          <p>Yeni siparişler burada anında görünür.</p>
        ) : (
          <p>Canlı izlemeyi başlatın — sağ panelde yeni siparişleri görürsünüz.</p>
        )}
      </div>

      {enabled && newOrders.length > 0 ? (
        <div className="max-h-56 space-y-1.5 overflow-y-auto border-t border-border/70 px-3 py-3">
          <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
            Onay bekleyen ({newOrders.length})
          </p>
          {newOrders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => onSelectOrder(order.id)}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-left transition-colors',
                selectedId === order.id
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-surface hover:bg-cream/80'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">#{order.order_number}</span>
                <OrderChannelBadge order={order} />
              </div>
              <p className="mt-0.5 text-sm font-medium">{order.customer_name}</p>
              <p className="text-xs text-muted">{formatOrderDateTime(order.created_at)}</p>
              <p className="mt-1 text-xs font-semibold text-accent">
                {formatPrice(Number(order.total))}
              </p>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
