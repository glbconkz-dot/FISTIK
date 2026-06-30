import type { Product, StorefrontSection, StorefrontSectionKey } from '@/types';

export function resolveSectionProducts(
  key: StorefrontSectionKey,
  sections: StorefrontSection[],
  products: Product[],
  fallback: Product[]
): Product[] {
  const config = sections.find((s) => s.key === key);
  if (!config) return fallback;

  const slugs = config.product_slugs?.filter(Boolean) ?? [];
  const ids = config.product_ids?.filter(Boolean) ?? [];

  if (slugs.length === 0 && ids.length === 0) return fallback;

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const byId = new Map(products.map((p) => [p.id, p]));

  const picked: Product[] = [];
  const seen = new Set<string>();

  for (const slug of slugs) {
    const product = bySlug.get(slug);
    if (product && !seen.has(product.id)) {
      seen.add(product.id);
      picked.push(product);
    }
  }

  if (picked.length === 0) {
    for (const id of ids) {
      const product = byId.get(id);
      if (product && !seen.has(product.id)) {
        seen.add(product.id);
        picked.push(product);
      }
    }
  }

  return picked.length > 0 ? picked : fallback;
}

export const STOREFRONT_SECTION_KEYS: StorefrontSectionKey[] = [
  'todays_favorites',
  'new_collection',
  'most_ordered',
  'chefs_selection',
];

export function countConfiguredSections(sections: StorefrontSection[]): number {
  return sections.filter(
    (s) => (s.product_slugs?.length ?? 0) > 0 || (s.product_ids?.length ?? 0) > 0
  ).length;
}
