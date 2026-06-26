import type { Order, OrderStatus } from '@/types';
import { formatDeliveryTimeLabel, getTodayInStoreTimezone } from '@/lib/order-dates';

export type OrderSection = OrderStatus;

export const ORDER_SECTIONS: {
  key: OrderSection;
  label: string;
  hint: string;
}[] = [
  {
    key: 'new',
    label: 'Yeni sipariş',
    hint: 'WhatsApp siparişleri — müşteriyi arayıp onaylayın',
  },
  {
    key: 'confirmed',
    label: 'Sevkiyat bekleyen',
    hint: 'Onaylandı — teslim günü ve saatine göre sıralı',
  },
  {
    key: 'shipped',
    label: 'Sevkiyata verilen',
    hint: 'Kuryeye verildi — teslim bilgisi gelince tamamlayın',
  },
  {
    key: 'completed',
    label: 'Tamamlanan',
    hint: 'Müşteriye teslim edildi',
  },
  {
    key: 'cancelled',
    label: 'İptal edilen',
    hint: 'İptal nedeni kayıtlı siparişler',
  },
];

/** HH:MM veya metin içinden saat çıkarıp sıralama için dakika döner */
export function parseDeliveryTimeMinutes(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (!match) return 24 * 60;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function filterOrdersBySection(orders: Order[], section: OrderSection): Order[] {
  return orders.filter((o) => o.status === section);
}

export function sortOrdersForSection(orders: Order[], section: OrderSection): Order[] {
  const copy = [...orders];

  if (section === 'confirmed' || section === 'shipped') {
    return copy.sort((a, b) => {
      const byDate = a.delivery_date.localeCompare(b.delivery_date);
      if (byDate !== 0) return byDate;

      const byTime =
        parseDeliveryTimeMinutes(a.delivery_time) - parseDeliveryTimeMinutes(b.delivery_time);
      if (byTime !== 0) return byTime;

      if (section === 'shipped') {
        return (a.shipped_at ?? '').localeCompare(b.shipped_at ?? '');
      }

      return a.created_at.localeCompare(b.created_at);
    });
  }

  if (section === 'completed') {
    return copy.sort((a, b) =>
      (b.completed_at ?? b.created_at).localeCompare(a.completed_at ?? a.created_at)
    );
  }

  if (section === 'cancelled') {
    return copy.sort((a, b) =>
      (b.cancelled_at ?? b.created_at).localeCompare(a.cancelled_at ?? a.created_at)
    );
  }

  return copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function countOrdersBySection(orders: Order[], section: OrderSection): number {
  return orders.filter((o) => o.status === section).length;
}

export function formatDeliverySchedule(order: Order): string {
  const today = getTodayInStoreTimezone();
  const day = order.delivery_date.slice(0, 10) === today ? 'Bugün' : order.delivery_date;
  return `${day} · ${formatDeliveryTimeLabel(order.delivery_time)}`;
}

export function isOrderCreatedToday(order: Order): boolean {
  const today = getTodayInStoreTimezone();
  return order.created_at.slice(0, 10) === today || order.delivery_date.slice(0, 10) === today;
}

export function getAlmatyIsoFromDateAndTime(date: string, time: string): string {
  const day = date.slice(0, 10);
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return new Date().toISOString();
  const hh = match[1].padStart(2, '0');
  const mm = match[2];
  return new Date(`${day}T${hh}:${mm}:00+05:00`).toISOString();
}

export function getCurrentAlmatyTimeValue(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Almaty',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const hour = parts.find((p) => p.type === 'hour')?.value ?? '12';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

export function validateTimeValue(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim());
}

export const CANCEL_NOTE_PREFIX = '[İptal]';

export function appendCancelNote(existingNotes: string, reason: string): string {
  const line = `${CANCEL_NOTE_PREFIX} ${reason.trim()}`;
  const trimmed = existingNotes.trim();
  return trimmed ? `${trimmed}\n${line}` : line;
}

/** cancel_reason sütunu yoksa notes içinden okur */
export function getCancelReason(
  order: Pick<Order, 'cancel_reason' | 'notes'>
): string | null {
  const direct = order.cancel_reason?.trim();
  if (direct) return direct;

  const notes = order.notes ?? '';
  for (const line of notes.split('\n')) {
    if (line.trimStart().startsWith(CANCEL_NOTE_PREFIX)) {
      const reason = line.trimStart().slice(CANCEL_NOTE_PREFIX.length).trim();
      if (reason) return reason;
    }
  }
  return null;
}

export function getCustomerNotes(order: Pick<Order, 'notes'>): string | null {
  const notes = order.notes?.trim();
  if (!notes) return null;

  const lines = notes
    .split('\n')
    .filter((line) => !line.trimStart().startsWith(CANCEL_NOTE_PREFIX));
  const cleaned = lines.join('\n').trim();
  return cleaned || null;
}

/** 14:30, 9:05, 2:30 PM → 24 saat HH:MM */
export function normalizeTimeInput(value: string): string | null {
  const trimmed = value.trim();

  const twentyFour = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFour) {
    const normalized = `${twentyFour[1].padStart(2, '0')}:${twentyFour[2]}`;
    return validateTimeValue(normalized) ? normalized : null;
  }

  const twelve = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (twelve) {
    let hour = Number(twelve[1]) % 12;
    if (twelve[3].toUpperCase() === 'PM') hour += 12;
    const normalized = `${String(hour).padStart(2, '0')}:${twelve[2]}`;
    return validateTimeValue(normalized) ? normalized : null;
  }

  return null;
}
