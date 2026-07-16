'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Order } from '@/types';

const LIVE_STORAGE_KEY = 'fistik-admin-live-orders';
const DEFAULT_INTERVAL_MS = 20_000;

export function readLiveOrdersEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = window.localStorage.getItem(LIVE_STORAGE_KEY);
  if (stored === null) return true;
  return stored === '1';
}

export function writeLiveOrdersEnabled(enabled: boolean) {
  window.localStorage.setItem(LIVE_STORAGE_KEY, enabled ? '1' : '0');
}

export function useLiveOrders(
  initialOrders: Order[],
  enabled: boolean,
  intervalMs = DEFAULT_INTERVAL_MS
) {
  const [orders, setOrders] = useState(initialOrders);
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [newArrivalCount, setNewArrivalCount] = useState(0);
  const knownIdsRef = useRef(new Set(initialOrders.map((o) => o.id)));

  useEffect(() => {
    setOrders(initialOrders);
    knownIdsRef.current = new Set(initialOrders.map((o) => o.id));
  }, [initialOrders]);

  const sync = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (res.status === 401) {
        setSyncError('Oturum kapalı — yeniden giriş yapın');
        return;
      }
      if (!res.ok) {
        setSyncError('Siparişler alınamadı');
        return;
      }

      const data = (await res.json()) as { orders: Order[]; syncedAt: string };
      const fresh = data.orders ?? [];

      let arrivals = 0;
      for (const order of fresh) {
        if (!knownIdsRef.current.has(order.id)) {
          arrivals += 1;
          knownIdsRef.current.add(order.id);
        }
      }

      if (arrivals > 0) {
        setNewArrivalCount((c) => c + arrivals);
      }

      setOrders((prev) => {
        const prevById = new Map(prev.map((o) => [o.id, o]));
        return fresh.map((incoming) => {
          const previous = prevById.get(incoming.id);
          const keepItems =
            Boolean(previous?.items?.length) &&
            (!Array.isArray(incoming.items) || incoming.items.length === 0);
          return keepItems
            ? { ...incoming, items: previous!.items }
            : { ...incoming, items: incoming.items ?? [] };
        });
      });
      setSyncedAt(new Date(data.syncedAt));
      setSyncError(null);
    } catch {
      setSyncError('Bağlantı hatası');
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    void sync();
    const id = window.setInterval(() => void sync(), intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs, sync]);

  const clearNewArrivals = useCallback(() => {
    setNewArrivalCount(0);
  }, []);

  return {
    orders,
    setOrders,
    syncedAt,
    syncError,
    newArrivalCount,
    clearNewArrivals,
    refreshNow: sync,
  };
}
