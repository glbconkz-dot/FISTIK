import type { Locale } from '@/types';

function getWhatsAppDigits(): string {
  const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '77014737575').replace(/\D/g, '');
  // Kazakistan: 10 hane gelirse başına 7 ekle
  if (digits.length === 10) return `7${digits}`;
  return digits;
}

function formatKzPhone(digits: string): string {
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
  }
  return `+${digits}`;
}

export const BUSINESS = {
  name: 'Fistik',
  bin: '150640023753K3',
  get phone() {
    return formatKzPhone(getWhatsAppDigits());
  },
  get phoneWhatsApp() {
    return getWhatsAppDigits();
  },
  postalCode: '050900',
  instagram: {
    handle: 'fistik_almaty',
    url: 'https://www.instagram.com/fistik_almaty/',
  },
};

export const BUSINESS_ADDRESS: Record<
  Locale,
  { legalName: string; idLabel: string; lines: string[] }
> = {
  en: {
    legalName: 'Fistik LLP',
    idLabel: 'BIN',
    lines: [
      '050900 Almaty Region,',
      'Karasay District, Kaskelen,',
      '7A Karasay Batyr Street',
    ],
  },
  ru: {
    legalName: 'ТОО «Fistik»',
    idLabel: 'БИН',
    lines: [
      '050900 Алматинская обл.,',
      'Карасайский р-н, г. Каскелен,',
      'ул. Карасай Батыра 7А',
    ],
  },
  kk: {
    legalName: '«Fistik» ЖШС',
    idLabel: 'БСН',
    lines: [
      '050900 Алматы обл.,',
      'Карасай ауданы, Каскелен қ-сы,',
      'Карасай Батыр к-сі 7A',
    ],
  },
  tr: {
    legalName: 'Fistik LLP',
    idLabel: 'BIN',
    lines: [
      '050900 Almati Bölgesi,',
      'Karasay İlçesi, Kaskelen,',
      'Karasay Batır Caddesi 7A',
    ],
  },
};

export function getBusinessAddress(locale: Locale) {
  return BUSINESS_ADDRESS[locale];
}

export function getWhatsAppDigitsForLink(): string {
  return getWhatsAppDigits();
}

/** Resmi wa.me linki — yüklü WhatsApp / Business uygulamasını açar */
export function buildWhatsAppWaMeUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${phone}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Web — masaüstü ve footer */
export function getWhatsAppLink(message?: string): string {
  return buildWhatsAppWaMeUrl(getWhatsAppDigits(), message);
}

/** @deprecated wa.me kullanın */
export function buildWhatsAppWebUrl(phone: string, message?: string): string {
  return buildWhatsAppWaMeUrl(phone, message);
}

/**
 * Android — doğrudan WhatsApp Business (com.whatsapp.w4b).
 * Normal WhatsApp istenirse NEXT_PUBLIC_WHATSAPP_BUSINESS=false
 */
export function buildWhatsAppBusinessIntentUrl(phone: string, message: string): string {
  const text = encodeURIComponent(message);
  return `intent://send?phone=${phone}&text=${text}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`;
}

/** Mobilde dogrudan uygulama — api.whatsapp.com sayfasina dusmez */
export function buildWhatsAppAppUrl(phone: string, message?: string): string {
  const base = `whatsapp://send?phone=${phone}`;
  if (!message) return base;
  return `${base}&text=${encodeURIComponent(message)}`;
}

export function getInstagramLink(): string {
  return BUSINESS.instagram.url;
}
