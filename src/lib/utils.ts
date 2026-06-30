import type { Locale } from '@/types';
import { PRODUCT_KK, PRODUCT_TR } from '@/data/menu-names';

type LocalizedRecord = {
  slug?: string;
  name_en: string;
  name_ru: string;
  name_kk: string;
  name_tr: string;
  description_en?: string;
  description_ru?: string;
  description_kk?: string;
  description_tr?: string;
};

function isMissingTranslation(value: string | undefined, fallback: string): boolean {
  const trimmed = value?.trim();
  return !trimmed || trimmed === fallback.trim();
}

export function getLocalizedName(
  record: LocalizedRecord,
  locale: Locale
): string {
  const direct = record[`name_${locale}`]?.trim();

  if (locale === 'tr' && record.slug) {
    if (!isMissingTranslation(direct, record.name_en)) return direct!;
    return PRODUCT_TR[record.slug] ?? direct ?? record.name_en;
  }

  if (locale === 'kk' && record.slug) {
    if (!isMissingTranslation(direct, record.name_en)) return direct!;
    return PRODUCT_KK[record.slug] ?? direct ?? record.name_en;
  }

  if (direct) return direct;
  return record.name_en;
}

export function getLocalizedDescription(record: LocalizedRecord, locale: Locale): string {
  return record[`description_${locale}`] ?? '';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatPrice(amount: number): string {
  const symbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL ?? '₸';
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })} ${symbol}`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
