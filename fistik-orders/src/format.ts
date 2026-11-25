import type { ManagerOrder } from './types';

export function formatMoney(total: number): string {
  return `${Math.round(Number(total) || 0).toLocaleString('tr-TR')} ₸`;
}

export function channelLabel(order: ManagerOrder): 'B2B' | 'B2C' {
  return order.order_channel === 'b2b' ? 'B2B' : 'B2C';
}

export function statusLabel(status: string | null): string {
  switch (status) {
    case 'pending':
      return 'Bekliyor';
    case 'confirmed':
      return 'Onaylandı';
    case 'shipped':
      return 'Yolda';
    case 'completed':
      return 'Tamamlandı';
    case 'cancelled':
      return 'İptal';
    default:
      return status || '—';
  }
}

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
