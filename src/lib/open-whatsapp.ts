import {
  buildWhatsAppBusinessIntentUrl,
  buildWhatsAppWaMeUrl,
  getWhatsAppDigitsForLink,
} from '@/lib/business';

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

function preferWhatsAppBusiness(): boolean {
  return process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS !== 'false';
}

/**
 * Sipariş mesajı ile WhatsApp aç.
 * Mobilde wa.me (tek yönlendirme — indirme sayfasına düşmez).
 * Android + Business: doğrudan WhatsApp Business intent (chooser yok).
 */
export function openWhatsAppWithMessage(message: string): void {
  if (typeof window === 'undefined') return;

  const phone = getWhatsAppDigitsForLink();
  const waMeUrl = buildWhatsAppWaMeUrl(phone, message);

  if (isMobileDevice()) {
    if (isAndroid() && preferWhatsAppBusiness()) {
      window.location.href = buildWhatsAppBusinessIntentUrl(phone, message);
      return;
    }

    window.location.assign(waMeUrl);
    return;
  }

  const opened = window.open(waMeUrl, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.assign(waMeUrl);
  }
}

/** @deprecated openWhatsAppWithMessage kullanın */
export function openWhatsAppUrl(url: string): void {
  if (typeof window === 'undefined') return;
  window.location.assign(url);
}
