import type { Locale } from '@/types';

function getWhatsAppDigits(): string {
  const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '77782681755').replace(/\D/g, '');
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

export type BusinessLocationKey = 'sales' | 'production';

export interface BusinessLocation {
  key: BusinessLocationKey;
  label: string;
  lines: string[];
}

export interface BusinessAddressBundle {
  legalName: string;
  idLabel: string;
  locations: BusinessLocation[];
}

export const BUSINESS_ADDRESS: Record<Locale, BusinessAddressBundle> = {
  ru: {
    legalName: 'ТОО «Fistik»',
    idLabel: 'БИН',
    locations: [
      {
        key: 'sales',
        label: 'Филиал продаж — Алматы',
        lines: [
          'A15G7D2',
          'г. Алматы, ул. Ауэзова, д. 84',
          'текстильная улица 69',
        ],
      },
      {
        key: 'production',
        label: 'Производство и точка продаж — Каскелен',
        lines: [
          '050900 Алматинская обл.',
          'Карасайский р-н, г. Каскелен',
          'ул. Карасай Батыра 7А',
        ],
      },
    ],
  },
  kk: {
    legalName: '«Fistik» ЖШС',
    idLabel: 'БСН',
    locations: [
      {
        key: 'sales',
        label: 'Сату филиалы — Алматы',
        lines: [
          'A15G7D2',
          'Алматы қ., Ауэзов к-сі 84',
          'тоқымашы көшесі 69',
        ],
      },
      {
        key: 'production',
        label: 'Өндіріс және сату нүктесі — Каскелен',
        lines: [
          '050900 Алматы обл.',
          'Карасай ауданы, Каскелен қ-сы',
          'Карасай Батыр к-сі 7A',
        ],
      },
    ],
  },
  tr: {
    legalName: 'Fistik LLP',
    idLabel: 'BIN',
    locations: [
      {
        key: 'sales',
        label: 'Satış şubesi — Almatı',
        lines: [
          'A15G7D2',
          'Almatı, Auezov caddesi 84',
          'Tekstil sokağı 69',
        ],
      },
      {
        key: 'production',
        label: 'Üretim ve satış noktası — Kaskelen',
        lines: [
          '050900 Almatı Bölgesi',
          'Karasay İlçesi, Kaskelen',
          'Karasay Batır Caddesi 7A',
        ],
      },
    ],
  },
  en: {
    legalName: 'Fistik LLP',
    idLabel: 'BIN',
    locations: [
      {
        key: 'sales',
        label: 'Sales branch — Almaty',
        lines: [
          'A15G7D2',
          'Almaty, 84 Auezov St.',
          'Textile Street 69',
        ],
      },
      {
        key: 'production',
        label: 'Production & sales — Kaskelen',
        lines: [
          '050900 Almaty Region',
          'Karasay District, Kaskelen',
          '7A Karasay Batyr Street',
        ],
      },
    ],
  },
};

export function getBusinessAddress(locale: Locale): BusinessAddressBundle {
  return BUSINESS_ADDRESS[locale];
}

export function getBusinessLocation(
  locale: Locale,
  key: BusinessLocationKey
): BusinessLocation | undefined {
  return getBusinessAddress(locale).locations.find((loc) => loc.key === key);
}

export function getWhatsAppDigitsForLink(): string {
  return getWhatsAppDigits();
}

/** Resmi wa.me linki (https) — uygulama yükletmez; tarayıcı / yüklü WA açar */
export function buildWhatsAppWaMeUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${phone}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Web — masaüstü ve footer */
export function getWhatsAppLink(message?: string): string {
  return buildWhatsAppWaMeUrl(getWhatsAppDigits(), message);
}

export function getInstagramLink(): string {
  return BUSINESS.instagram.url;
}
