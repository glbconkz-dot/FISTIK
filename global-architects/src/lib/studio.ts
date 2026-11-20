import type { AppLocale } from '@/i18n/routing';

export const STUDIO = {
  name: 'KA Global Architects',
  shortName: 'KA Global',
  constructionName: 'KA Global Construction',
  phoneDisplay: '+7 727 296 04 79',
  phoneWhatsApp: '77272960479',
  email: 'info@global-kz.com',
  site: 'https://global-kz.com',
  years: 18,
  specialists: 80,
  activeProjects: 15,
  completedProjects: 120,
  directorYears: 24,
  licenseCategory: 'I',
} as const;

export const ADDRESS: Record<AppLocale, string[]> = {
  ru: ['г. Алматы, пр. Достык, 52/2', 'Гостиница Казахстан, 6 этаж, офис 605'],
  en: ['Almaty, 52/2 Dostyk Ave.', 'Kazakhstan Hotel, 6th floor, office 605'],
  tr: ['Almatı, Dostık Cad. 52/2', 'Kazakistan Oteli, 6. kat, ofis 605'],
  kk: ['Алматы, Достық даңғ. 52/2', 'Қазақстан қонақ үйі, 6-қабат, 605-кеңсе'],
};

export type Copy = Record<AppLocale, string>;

export function tx(copy: Copy, locale: AppLocale): string {
  return copy[locale] ?? copy.ru;
}

export function loc(ru: string, en: string, tr: string, kk: string): Copy {
  return { ru, en, tr, kk };
}
