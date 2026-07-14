import type { Locale } from '@/types';
import { getTodayInStoreTimezone } from '@/lib/order-dates';

export interface AddressFormFields {
  addressStreet: string;
  buildingNumber: string;
  floorApartment: string;
  addressNotes?: string;
}

const pendingDeliveryTime: Record<Locale, string> = {
  tr: 'Satış temsilcisi sipariş onayından sonra arayıp teslimat saatini bildirecek',
  kk: 'Сатушы өкілі тапсырысты растағаннан кейін хабарласып, жеткізу уақытын хабарлайды',
  ru: 'Менеджер свяжется после подтверждения заказа и согласует время доставки',
  en: 'A sales representative will call after order confirmation to arrange delivery time',
};

const addressLabels: Record<
  Locale,
  { building: string; apartment: string; extra: string }
> = {
  tr: { building: 'Bina', apartment: 'Kat/Daire', extra: 'Ek bilgi' },
  kk: { building: 'Үй нөмірі', apartment: 'Қабат/пәтер', extra: 'Қосымша' },
  ru: { building: 'Дом', apartment: 'Этаж/кв.', extra: 'Дополнительно' },
  en: { building: 'Building', apartment: 'Floor/Apt', extra: 'Extra info' },
};

/** Extract 10-digit Kazakhstan national number from any user input. */
export function extractKzNationalDigits(input: string): string {
  const cleaned = input.trim().replace(/^\(\+7\)\s*/, '').replace(/^\+7\s*/, '');

  let digits = cleaned.replace(/\D/g, '');

  if (digits.startsWith('7') && digits.length >= 11) {
    digits = digits.slice(1);
  } else if (digits.startsWith('8') && digits.length >= 11) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

export function isValidKzNationalPhone(input: string): boolean {
  return extractKzNationalDigits(input).length === 10;
}

/** National part only: 778 268 17 55 */
export function formatKzNationalDisplay(nationalDigits: string): string {
  const digits = extractKzNationalDigits(nationalDigits);
  if (!digits) return '';

  let formatted = digits.slice(0, 3);
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += ` ${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += ` ${digits.slice(8, 10)}`;
  return formatted;
}

/** Friendly display: +7 778 268 17 55 */
export function formatKzPhoneInput(nationalDigits: string): string {
  const national = formatKzNationalDisplay(nationalDigits);
  if (!national) return '';
  return `+7 ${national}`;
}

/** Normalize Kazakhstan mobile to E.164 +7XXXXXXXXXX for WhatsApp. */
export function normalizeKzPhone(input: string): string | null {
  const national = extractKzNationalDigits(input);
  if (national.length !== 10) {
    return null;
  }

  return `+7${national}`;
}

export function formatPhoneForDisplay(e164: string): string {
  const national = extractKzNationalDigits(e164);
  if (national.length !== 10) {
    return e164;
  }

  return formatKzPhoneInput(national);
}

export function getPendingDeliveryTime(locale: Locale): string {
  return pendingDeliveryTime[locale];
}

/** YYYY-MM-DD + N takvim günü (UTC noon, gün kayması yok) */
export function addCalendarDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.slice(0, 10).split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** Teslimat tarihi ile sipariş günü arasındaki takvim günü farkı (Almatı). */
export function getDeliveryDayOffset(deliveryDate: string, now = new Date()): number {
  const day = deliveryDate.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return Number.NaN;
  const today = getTodayInStoreTimezone(now);
  const t0 = Date.parse(`${today}T12:00:00Z`);
  const t1 = Date.parse(`${day}T12:00:00Z`);
  return Math.round((t1 - t0) / 86_400_000);
}

/**
 * B2B: sipariş günü teslim yok.
 * D+1 ve D+2 müşteri temsilcisi onayına tabi.
 * D+3 ve sonrası müşteri kendi seçebilir.
 */
export const B2B_SELF_SERVE_DELIVERY_MIN_OFFSET = 3;

export function getB2BSelfServeDeliveryMinDate(now = new Date()): string {
  return addCalendarDaysYmd(getTodayInStoreTimezone(now), B2B_SELF_SERVE_DELIVERY_MIN_OFFSET);
}

export function needsB2BDeliveryDateApproval(
  deliveryDate: string,
  now = new Date()
): boolean {
  const offset = getDeliveryDayOffset(deliveryDate, now);
  return offset === 1 || offset === 2;
}

const pendingB2BEarlyDeliveryTime: Record<Locale, string> = {
  tr: 'Ertesi gün / 2. gün teslimat — müşteri temsilcisi tarih ve saati teyit edecek',
  kk: 'Ертең / 2-күндік жеткізу — клиент өкілі күн мен уақытты растайды',
  ru: 'Доставка на завтра / через 2 дня — менеджер подтвердит дату и время',
  en: 'Next-day / day+2 delivery — account manager will confirm date and time',
};

export function getB2BPendingDeliveryTime(
  locale: Locale,
  needsDateApproval: boolean
): string {
  if (needsDateApproval) {
    return pendingB2BEarlyDeliveryTime[locale];
  }
  return pendingDeliveryTime[locale];
}

/** Yarın — Almatı saati (date input min için; aynı gün teslim yok) */
export function getMinDeliveryDate(now = new Date()): string {
  return addCalendarDaysYmd(getTodayInStoreTimezone(now), 1);
}

export function isDeliveryDateValid(date: string, now = new Date()): boolean {
  if (!date) return false;
  return date >= getMinDeliveryDate(now);
}

export function formatCheckoutAddress(
  fields: AddressFormFields,
  locale: Locale
): string {
  const l = addressLabels[locale];
  const parts = [fields.addressStreet.trim()];

  if (fields.buildingNumber.trim()) {
    parts.push(`${l.building}: ${fields.buildingNumber.trim()}`);
  }

  if (fields.floorApartment.trim()) {
    parts.push(`${l.apartment}: ${fields.floorApartment.trim()}`);
  }

  if (fields.addressNotes?.trim()) {
    parts.push(`${l.extra}: ${fields.addressNotes.trim()}`);
  }

  return parts.join(', ');
}
