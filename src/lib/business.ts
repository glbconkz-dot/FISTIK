import type { Locale } from '@/types';

/** Normalize to Kazakhstan digits: 7XXXXXXXXXX */
export function normalizeKzWhatsAppDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `7${digits}`;
  return digits;
}

export function formatKzPhone(digits: string): string {
  const d = normalizeKzWhatsAppDigits(digits);
  if (d.length === 11 && d.startsWith('7')) {
    return `+7 ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9, 11)}`;
  }
  return `+${d}`;
}

export type BranchKey = 'almaty' | 'kaskelen';
export type OrderChannel = 'b2c' | 'b2b';

/**
 * Şube / kanal hatları (sabit).
 * B2C sipariş WhatsApp hedefi: NEXT_PUBLIC_B2C_ORDER_BRANCH=kaskelen|almaty
 *   (şimdi kaskelen; Almatı satışa hazır olunca almaty)
 * Opsiyonel override: NEXT_PUBLIC_WHATSAPP_NUMBER
 * B2B override: NEXT_PUBLIC_B2B_WHATSAPP_NUMBER
 */
export const BRANCH_WHATSAPP: Record<
  BranchKey,
  { digits: string; label: Record<Locale, string> }
> = {
  almaty: {
    digits: '77010995571',
    label: {
      ru: 'Алматы',
      kk: 'Алматы',
      tr: 'Almatı',
      en: 'Almaty',
    },
  },
  kaskelen: {
    digits: '77782681755',
    label: {
      ru: 'Каскелен',
      kk: 'Каскелен',
      tr: 'Kaskelen',
      en: 'Kaskelen',
    },
  },
};

/** B2B sipariş / operasyon WhatsApp hattı */
export const B2B_WHATSAPP_DIGITS_DEFAULT = '77010995573';

const DEFAULT_B2C_ORDER_BRANCH: BranchKey = 'kaskelen';

function parseB2cOrderBranch(): BranchKey {
  const raw = (process.env.NEXT_PUBLIC_B2C_ORDER_BRANCH ?? DEFAULT_B2C_ORDER_BRANCH)
    .trim()
    .toLowerCase();
  if (raw === 'almaty' || raw === 'almati' || raw === 'алматы') return 'almaty';
  return 'kaskelen';
}

/** Aktif B2C sipariş hattının şubesi (env ile geçiş) */
export function getB2cOrderBranch(): BranchKey {
  return parseB2cOrderBranch();
}

function getB2cOrderDigits(): string {
  const override = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  if (override) return normalizeKzWhatsAppDigits(override);
  return BRANCH_WHATSAPP[getB2cOrderBranch()].digits;
}

function getB2bOrderDigits(): string {
  const override = process.env.NEXT_PUBLIC_B2B_WHATSAPP_NUMBER?.trim();
  if (override) return normalizeKzWhatsAppDigits(override);
  return B2B_WHATSAPP_DIGITS_DEFAULT;
}

export function getBranchWhatsAppDigits(branch: BranchKey): string {
  return BRANCH_WHATSAPP[branch].digits;
}

export function getBranchPhoneDisplay(branch: BranchKey): string {
  return formatKzPhone(getBranchWhatsAppDigits(branch));
}

export function getOrderWhatsAppDigits(channel: OrderChannel): string {
  return channel === 'b2b' ? getB2bOrderDigits() : getB2cOrderDigits();
}

export function getOrderPhoneDisplay(channel: OrderChannel): string {
  return formatKzPhone(getOrderWhatsAppDigits(channel));
}

export const BUSINESS = {
  name: 'Fistik',
  bin: '150640023753K3',
  /** Aktif B2C sipariş / genel iletişim hattı (şimdilik Kaskelen) */
  get phone() {
    return getOrderPhoneDisplay('b2c');
  },
  get phoneWhatsApp() {
    return getOrderWhatsAppDigits('b2c');
  },
  get b2bPhone() {
    return getOrderPhoneDisplay('b2b');
  },
  get b2bPhoneWhatsApp() {
    return getOrderWhatsAppDigits('b2b');
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
  branch: BranchKey;
  label: string;
  lines: string[];
  phoneDisplay: string;
  phoneWhatsApp: string;
}

export interface BusinessAddressBundle {
  legalName: string;
  idLabel: string;
  locations: BusinessLocation[];
}

function withBranchPhones(
  locations: Omit<BusinessLocation, 'phoneDisplay' | 'phoneWhatsApp'>[]
): BusinessLocation[] {
  return locations.map((loc) => ({
    ...loc,
    phoneDisplay: getBranchPhoneDisplay(loc.branch),
    phoneWhatsApp: getBranchWhatsAppDigits(loc.branch),
  }));
}

export const BUSINESS_ADDRESS: Record<Locale, BusinessAddressBundle> = {
  ru: {
    legalName: 'ТОО «Fistik»',
    idLabel: 'БИН',
    locations: withBranchPhones([
      {
        key: 'sales',
        branch: 'almaty',
        label: 'Филиал продаж — Алматы',
        lines: ['A15G7D2', 'г. Алматы, ул. Ауэзова, д. 84', 'текстильная улица 69'],
      },
      {
        key: 'production',
        branch: 'kaskelen',
        label: 'Производство и точка продаж — Каскелен',
        lines: [
          '050900 Алматинская обл.',
          'Карасайский р-н, г. Каскелен',
          'ул. Карасай Батыра 7А',
        ],
      },
    ]),
  },
  kk: {
    legalName: '«Fistik» ЖШС',
    idLabel: 'БСН',
    locations: withBranchPhones([
      {
        key: 'sales',
        branch: 'almaty',
        label: 'Сату филиалы — Алматы',
        lines: ['A15G7D2', 'Алматы қ., Ауэзов к-сі 84', 'тоқымашы көшесі 69'],
      },
      {
        key: 'production',
        branch: 'kaskelen',
        label: 'Өндіріс және сату нүктесі — Каскелен',
        lines: [
          '050900 Алматы обл.',
          'Карасай ауданы, Каскелен қ-сы',
          'Карасай Батыр к-сі 7A',
        ],
      },
    ]),
  },
  tr: {
    legalName: 'Fistik LLP',
    idLabel: 'BIN',
    locations: withBranchPhones([
      {
        key: 'sales',
        branch: 'almaty',
        label: 'Satış şubesi — Almatı',
        lines: ['A15G7D2', 'Almatı, Auezov caddesi 84', 'Tekstil sokağı 69'],
      },
      {
        key: 'production',
        branch: 'kaskelen',
        label: 'Üretim ve satış noktası — Kaskelen',
        lines: [
          '050900 Almatı Bölgesi',
          'Karasay İlçesi, Kaskelen',
          'Karasay Batır Caddesi 7A',
        ],
      },
    ]),
  },
  en: {
    legalName: 'Fistik LLP',
    idLabel: 'BIN',
    locations: withBranchPhones([
      {
        key: 'sales',
        branch: 'almaty',
        label: 'Sales branch — Almaty',
        lines: ['A15G7D2', 'Almaty, 84 Auezov St.', 'Textile Street 69'],
      },
      {
        key: 'production',
        branch: 'kaskelen',
        label: 'Production & sales — Kaskelen',
        lines: [
          '050900 Almaty Region',
          'Karasay District, Kaskelen',
          '7A Karasay Batyr Street',
        ],
      },
    ]),
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

/** @deprecated use getOrderWhatsAppDigits('b2c') */
export function getWhatsAppDigitsForLink(): string {
  return getOrderWhatsAppDigits('b2c');
}

/** Resmi wa.me linki (https) — uygulama yükletmez; tarayıcı / yüklü WA açar */
export function buildWhatsAppWaMeUrl(phone: string, message?: string): string {
  const digits = normalizeKzWhatsAppDigits(phone);
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** B2C sipariş / genel site WhatsApp */
export function getWhatsAppLink(message?: string): string {
  return buildWhatsAppWaMeUrl(getOrderWhatsAppDigits('b2c'), message);
}

/** B2B sipariş WhatsApp */
export function getB2BOrderWhatsAppLink(message?: string): string {
  return buildWhatsAppWaMeUrl(getOrderWhatsAppDigits('b2b'), message);
}

export function getBranchWhatsAppLink(branch: BranchKey, message?: string): string {
  return buildWhatsAppWaMeUrl(getBranchWhatsAppDigits(branch), message);
}

export function getInstagramLink(): string {
  return BUSINESS.instagram.url;
}

/** WhatsApp sipariş metninde şube etiketi */
export function getB2cFulfillmentBranchLabel(locale: Locale): string {
  return BRANCH_WHATSAPP[getB2cOrderBranch()].label[locale];
}
