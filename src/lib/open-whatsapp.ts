import {
  buildWhatsAppWaMeUrl,
  getWhatsAppDigitsForLink,
} from '@/lib/business';

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function buildOrderWhatsAppUrl(message: string, phoneDigits?: string): string {
  const phone = (phoneDigits ?? getWhatsAppDigitsForLink()).replace(/\D/g, '');
  return buildWhatsAppWaMeUrl(phone, message);
}

export type WhatsAppOpenSession = {
  /** Sipariş başarılı → WhatsApp'ı aç (wa.me). */
  finish: (message: string, phoneDigits?: string) => void;
  /** Sipariş başarısız → boş sekmeyi kapat. */
  cancel: () => void;
};

/**
 * Submit tıklamasında, await ÖNCESİ çağırın (kullanıcı jesti korunur).
 * Masaüstünde boş sekme açılır; mobilde sipariş sonrası aynı sekmede wa.me'ye gidilir.
 *
 * why: await sonrası window.open / whatsapp:// çoğu telefonda sessizce başarısız olur.
 */
export function beginWhatsAppOpen(): WhatsAppOpenSession {
  if (typeof window === 'undefined') {
    return { finish: () => undefined, cancel: () => undefined };
  }

  const mobile = isMobileDevice();
  const tab = mobile ? null : window.open('about:blank', '_blank');

  return {
    finish(message: string, phoneDigits?: string) {
      const url = buildOrderWhatsAppUrl(message, phoneDigits);

      if (tab && !tab.closed) {
        try {
          tab.location.replace(url);
          return;
        } catch {
          try {
            tab.close();
          } catch {
            /* ignore */
          }
        }
      }

      // Mobil veya popup engelli: aynı sekmede wa.me (en güvenilir yol)
      window.location.assign(url);
    },
    cancel() {
      if (tab && !tab.closed) {
        try {
          tab.close();
        } catch {
          /* ignore */
        }
      }
    },
  };
}

/**
 * Hemen aç (senkron tıklama). Async sipariş akışında beginWhatsAppOpen kullanın.
 */
export function openWhatsAppWithMessage(message: string, phoneDigits?: string): void {
  if (typeof window === 'undefined') return;
  const url = buildOrderWhatsAppUrl(message, phoneDigits);
  const mobile = isMobileDevice();

  if (mobile) {
    window.location.assign(url);
    return;
  }

  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.assign(url);
  }
}

/** @deprecated openWhatsAppWithMessage / beginWhatsAppOpen kullanın */
export function openWhatsAppUrl(url: string): void {
  if (typeof window === 'undefined') return;
  window.location.assign(url);
}
