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

/** Yarın — Almatı saati (date input min için) */
export function getMinDeliveryDate(now = new Date()): string {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getTodayInStoreTimezone(tomorrow);
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
