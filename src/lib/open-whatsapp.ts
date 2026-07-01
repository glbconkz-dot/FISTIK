import {
  buildWhatsAppAppUrl,
  buildWhatsAppWaMeUrl,
  getWhatsAppDigitsForLink,
} from '@/lib/business';

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Siparis mesaji ile WhatsApp ac.
 * Mobilde whatsapp:// — tarayici/api.whatsapp.com araya girmez.
 * Masaustunde wa.me yeni sekmede.
 */
export function openWhatsAppWithMessage(message: string): void {
  if (typeof window === 'undefined') return;

  const phone = getWhatsAppDigitsForLink();
  const appUrl = buildWhatsAppAppUrl(phone, message);
  const webUrl = buildWhatsAppWaMeUrl(phone, message);

  if (isMobileDevice()) {
    window.location.assign(appUrl);
    return;
  }

  const opened = window.open(webUrl, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.assign(webUrl);
  }
}

/** @deprecated openWhatsAppWithMessage kullanın */
export function openWhatsAppUrl(url: string): void {
  if (typeof window === 'undefined') return;
  window.location.assign(url);
}
