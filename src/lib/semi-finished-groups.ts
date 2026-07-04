import type { Product } from '@/types';

export interface SemiFinishedGroup {
  labelKey: string;
  filter: (slug: string) => boolean;
}

export const SEMI_FINISHED_PRODUCT_GROUPS: SemiFinishedGroup[] = [
  { labelKey: 'semiGroupBorek6', filter: (slug) => slug.startsWith('frozen-borek-') },
  { labelKey: 'semiGroupMini16', filter: (slug) => slug.startsWith('mini-borek-') },
  { labelKey: 'semiGroupSarma', filter: (slug) => slug.startsWith('sarma-borek-') },
  { labelKey: 'semiGroupWaffle', filter: (slug) => slug === 'semi-waffle' },
];

export function groupSemiFinishedProducts(
  products: Product[]
): { labelKey: string; products: Product[] }[] {
  return SEMI_FINISHED_PRODUCT_GROUPS.map((group) => ({
    labelKey: group.labelKey,
    products: products
      .filter((p) => group.filter(p.slug))
      .sort((a, b) => a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en)),
  })).filter((group) => group.products.length > 0);
}

export function isSemiFinishedBorekProduct(slug: string): boolean {
  return (
    slug.startsWith('frozen-borek-') ||
    slug.startsWith('mini-borek-') ||
    slug.startsWith('sarma-borek-') ||
    slug.startsWith('borek-')
  );
}

export function showsSemiFinishedPackNote(slug: string): boolean {
  return isSemiFinishedBorekProduct(slug) || slug === 'semi-waffle';
}
