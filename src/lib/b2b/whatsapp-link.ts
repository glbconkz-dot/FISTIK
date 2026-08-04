import {
  buildWhatsAppWaMeUrl,
  getOrderWhatsAppDigits,
  normalizeKzWhatsAppDigits,
} from '@/lib/business';

/** B2B sipariş / müşteri WhatsApp hattı (+77010995573, kodda sabit) */
export function getB2BWhatsAppDigitsForLink(): string {
  return getOrderWhatsAppDigits('b2b');
}

export function getB2BWhatsAppLink(message?: string): string {
  return buildWhatsAppWaMeUrl(normalizeKzWhatsAppDigits(getB2BWhatsAppDigitsForLink()), message);
}
