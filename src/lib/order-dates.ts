/** Fırın — Almatı saati */
export const STORE_TIMEZONE = 'Asia/Almaty';

export function getTodayInStoreTimezone(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: STORE_TIMEZONE }).format(now);
}

export function canMarkOrderCompleted(deliveryDate: string, now = new Date()): boolean {
  const delivery = deliveryDate.slice(0, 10);
  return getTodayInStoreTimezone(now) >= delivery;
}

function almatyTimeParts(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: STORE_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso));
}

/** Her zaman 24 saat: 14:30 */
export function formatOrderTime(iso: string): string {
  const parts = almatyTimeParts(iso);
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

/** Tarih + saat — saat kısmı her zaman 24 saat */
export function formatOrderDateTime(iso: string, locale = 'tr-TR'): string {
  const date = new Date(iso);
  const datePart = new Intl.DateTimeFormat(locale, {
    timeZone: STORE_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
  return `${datePart}, ${formatOrderTime(iso)}`;
}

export function formatOrderDate(iso: string, locale = 'tr-TR'): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: STORE_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

/** Teslim saati metnini göster — HH:MM ise olduğu gibi */
export function formatDeliveryTimeLabel(time: string): string {
  const match = time.match(/(\d{1,2}:\d{2})/);
  if (match) {
    const [hh, mm] = match[1].split(':');
    return `${hh.padStart(2, '0')}:${mm}`;
  }
  return time;
}
