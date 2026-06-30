import type { Product, StorefrontSection, StorefrontSectionKey } from '@/types';

export function resolveSectionProducts(
  key: StorefrontSectionKey,
  sections: StorefrontSection[],
  products: Product[],
  fallback: Product[]
): Product[] {
  const config = sections.find((s) => s.key === key);
  if (!config?.product_ids?.length) return fallback;

  const byId = new Map(products.map((p) => [p.id, p]));
  const picked = config.product_ids
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p));

  return picked.length > 0 ? picked : fallback;
}

export const STOREFRONT_SECTION_KEYS: StorefrontSectionKey[] = [
  'todays_favorites',
  'new_collection',
  'most_ordered',
  'chefs_selection',
];
