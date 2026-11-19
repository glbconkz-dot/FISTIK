import {
  buildWhatsAppAppUrl,
  buildWhatsAppWaMeUrl,
} from '@/lib/whatsapp';
import { STUDIO } from '@/lib/studio';

function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export function openWhatsAppWithMessage(message: string, phoneDigits?: string): void {
  if (typeof window === 'undefined') return;

  const phone = phoneDigits ?? STUDIO.phoneWhatsApp;
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
