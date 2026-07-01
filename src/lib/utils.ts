import type { Locale } from '@/types';
import {
  CATEGORY_KK,
  CATEGORY_RU,
  CATEGORY_TR,
  PRODUCT_KK,
  PRODUCT_RU,
  PRODUCT_TR,
} from '@/data/menu-names';

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

const SLUG_NAMES: Record<Exclude<Locale, 'en'>, Record<string, string>> = {
  tr: { ...CATEGORY_TR, ...PRODUCT_TR },
  ru: { ...CATEGORY_RU, ...PRODUCT_RU },
  kk: { ...CATEGORY_KK, ...PRODUCT_KK },
};

const DEFAULT_DESCRIPTION: Record<Locale, string> = {
  en: 'Handcrafted fresh at Fistik bakery, Kaskelen.',
  ru: 'Свеже приготовлено в пекарне Fistik, Каскелен.',
  kk: 'Каскелендегі Fistik пекарнясында жаңа дайындалған.',
  tr: "Kaskelen'deki Fistik fırınında taze hazırlanır.",
};

const LATIN_BRAND = /^(Oreo|Tiramisu|Lotus|Crunch|Snickers|Medovik|Waffle|Hamburger|Red Velvet|Whoopie Pie)$/i;

function hasCyrillic(value: string): boolean {
  return /[\u0400-\u04FF]/.test(value);
}

function isMissingTranslation(value: string | undefined, fallback: string): boolean {
  const trimmed = value?.trim();
  return !trimmed || trimmed === fallback.trim();
}

function shouldUseSlugFallback(
  record: LocalizedRecord,
  locale: Exclude<Locale, 'en'>,
  direct: string | undefined
): boolean {
  if (!record.slug || !SLUG_NAMES[locale][record.slug]) return false;
  if (!direct?.trim()) return true;
  if (isMissingTranslation(direct, record.name_en)) return true;

  if (locale === 'tr') {
    if (hasCyrillic(direct)) return true;
    return false;
  }

  if (record.name_tr && direct.trim() === record.name_tr.trim()) return true;

  if (!hasCyrillic(direct) && direct.length > 2 && !LATIN_BRAND.test(direct.trim())) {
    return true;
  }

  return false;
}

export function getLocalizedNameBySlug(
  slug: string,
  locale: Locale,
  fallback?: string
): string {
  if (locale !== 'en') {
    const mapped = SLUG_NAMES[locale][slug];
    if (mapped) return mapped;
  }
  return fallback?.trim() || slug;
}

export function getLocalizedName(record: LocalizedRecord, locale: Locale): string {
  if (locale === 'en') {
    return record.name_en?.trim() || (record.slug ? getLocalizedNameBySlug(record.slug, 'en') : '');
  }

  const direct = record[`name_${locale}`]?.trim();
  const slug = record.slug;
  const map = SLUG_NAMES[locale];

  if (slug && shouldUseSlugFallback(record, locale, direct)) {
    return map[slug] ?? direct ?? record.name_en;
  }

  if (direct) return direct;
  if (slug && map[slug]) return map[slug];
  return record.name_en;
}

export function getLocalizedDescription(record: LocalizedRecord, locale: Locale): string {
  const direct = record[`description_${locale}`]?.trim();
  if (direct) return direct;

  const en = record.description_en?.trim();
  if (locale === 'en' && en) return en;

  return DEFAULT_DESCRIPTION[locale] ?? DEFAULT_DESCRIPTION.en;
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
  return `${Math.round(amount)} ${symbol}`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
