import { productInCategory } from '@/lib/category-utils';
import type { Category, Product, StorefrontSection } from '@/types';

/**
 * Public B2C / B2B menüden kaldırılan, admin/DB’de saklanan ürünler.
 * Yeniden göstermek için slug’ı buradan çıkarın ve products.is_active = true yapın.
 */
export const ARCHIVED_STOREFRONT_PRODUCT_SLUGS = new Set([
  'pack-crunch',
  'pack-oreo',
  'art-hamburger',
  'tart-dark-chocolate',
  'eclair-mini-pistachio',
  'eclair-mini-hazelnut',
  'eclair-mini-vanilla',
  'eclair-mini-mastic',
  'eclair-mini-strawberry',
  'eclair-mini-raspberry',
  'eclair-mini-cherry',
  'eclair-mini-pineapple',
]);

/** Mini Ekler kategorisi — ürünler arşivde, internette kutu da görünmesin. */
export const ARCHIVED_STOREFRONT_CATEGORY_SLUGS = new Set(['eclairs-mini']);

export function isArchivedStorefrontProduct(slug: string | null | undefined): boolean {
  return Boolean(slug && ARCHIVED_STOREFRONT_PRODUCT_SLUGS.has(slug));
}

export function isArchivedStorefrontCategory(slug: string | null | undefined): boolean {
  return Boolean(slug && ARCHIVED_STOREFRONT_CATEGORY_SLUGS.has(slug));
}

export function filterPublicCatalog<
  T extends {
    products: Product[];
    categories: Category[];
    storefrontSections?: StorefrontSection[];
  },
>(catalog: T): T {
  const products = catalog.products.filter((product) => !isArchivedStorefrontProduct(product.slug));
  const visibleIds = new Set(products.map((product) => product.id));
  const categories = catalog.categories.filter((category) => {
    if (isArchivedStorefrontCategory(category.slug)) return false;
    return products.some((product) => productInCategory(product, category));
  });
  const storefrontSections = catalog.storefrontSections?.map((section) => ({
    ...section,
    product_slugs: (section.product_slugs ?? []).filter((slug) => !isArchivedStorefrontProduct(slug)),
    product_ids: (section.product_ids ?? []).filter((id) => visibleIds.has(id)),
  }));

  return {
    ...catalog,
    products,
    categories,
    ...(storefrontSections ? { storefrontSections } : {}),
  } as T;
}
