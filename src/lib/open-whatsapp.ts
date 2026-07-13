import {
  buildWhatsAppWaMeUrl,
  getWhatsAppDigitsForLink,
} from '@/lib/business';

/** Sadece https://wa.me — uygulama şeması / intent / mağaza yönlendirmesi yok. */
export function buildOrderWhatsAppUrl(message: string, phoneDigits?: string): string {
  const phone = (phoneDigits ?? getWhatsAppDigitsForLink()).replace(/\D/g, '');
  return buildWhatsAppWaMeUrl(phone, message);
}

/**
 * @deprecated Sipariş sonrası otomatik açma kullanmayın — uygulama yükleme / seçici çıkarır.
 * Kullanıcıya tek bir <a href={wa.me}> butonu gösterin.
 */
export function openWhatsAppWithMessage(message: string, phoneDigits?: string): void {
  if (typeof window === 'undefined') return;
  window.location.assign(buildOrderWhatsAppUrl(message, phoneDigits));
}

/** @deprecated */
export type WhatsAppOpenSession = {
  finish: (message: string, phoneDigits?: string) => void;
  cancel: () => void;
};

/** @deprecated Otomatik açma kaldırıldı — boş no-op (eski çağrıları kırmamak için). */
export function beginWhatsAppOpen(): WhatsAppOpenSession {
  return {
    finish: () => undefined,
    cancel: () => undefined,
  };
}

/** @deprecated */
export function openWhatsAppUrl(url: string): void {
  if (typeof window === 'undefined') return;
  window.location.assign(url);
}
