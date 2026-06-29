import {
  buildWhatsAppAppUrl,
  buildWhatsAppWebUrl,
  getWhatsAppDigitsForLink,
} from '@/lib/business';

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Sipariş mesajı ile WhatsApp aç.
 * Mobilde önce whatsapp:// (uygulama), yoksa api.whatsapp.com.
 * wa.me kullanılmıyor — çoğu telefonda "uygulama indir" sayfasına düşüyordu.
 */
export function openWhatsAppWithMessage(message: string): void {
  if (typeof window === 'undefined') return;

  const phone = getWhatsAppDigitsForLink();
  const appUrl = buildWhatsAppAppUrl(phone, message);
  const webUrl = buildWhatsAppWebUrl(phone, message);

  if (isMobileDevice()) {
    window.location.href = appUrl;
    window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        window.location.href = webUrl;
      }
    }, 1200);
    return;
  }

  const opened = window.open(webUrl, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.href = webUrl;
  }
}

/** @deprecated openWhatsAppWithMessage kullanın */
export function openWhatsAppUrl(url: string): void {
  if (typeof window === 'undefined') return;
  window.location.href = url;
}
