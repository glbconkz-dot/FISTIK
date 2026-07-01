import { buildWhatsAppWaMeUrl, getWhatsAppDigitsForLink } from '@/lib/business';

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Siparis mesaji ile WhatsApp ac.
 * Her zaman resmi wa.me — Business chooser yok, indirme sayfasina dusmez.
 */
export function openWhatsAppWithMessage(message: string): void {
  if (typeof window === 'undefined') return;

  const url = buildWhatsAppWaMeUrl(getWhatsAppDigitsForLink(), message);

  if (isMobileDevice()) {
    window.location.assign(url);
    return;
  }

  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.assign(url);
  }
}

/** @deprecated openWhatsAppWithMessage kullanın */
export function openWhatsAppUrl(url: string): void {
  if (typeof window === 'undefined') return;
  window.location.assign(url);
}
