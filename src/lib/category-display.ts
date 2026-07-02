import { coverImageForCategory, productInCategory } from '@/lib/category-utils';
import type { Category, Product } from '@/types';

/** Alt kategoriler tek chip / tek kutu altinda birlesir */
export const CATEGORY_GROUP_SLUGS: Record<string, string[]> = {
  'semi-finished': ['semi-finished', 'frozen-boreks'],
};

export const HIDDEN_CATEGORY_SLUGS = new Set(['frozen-boreks']);

export function getCategoryGroupSlugs(slug: string): string[] {
  return CATEGORY_GROUP_SLUGS[slug] ?? [slug];
}

export function getDisplayCategories(categories: Category[]): Category[] {
  return categories
    .filter((c) => c.is_active && !HIDDEN_CATEGORY_SLUGS.has(c.slug))
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function productMatchesCategoryFilter(
  product: Product,
  selectedSlug: string,
  categories: Category[]
): boolean {
  const groupSlugs = getCategoryGroupSlugs(selectedSlug);
  return groupSlugs.some((slug) => {
    const cat = categories.find((c) => c.slug === slug);
    return cat ? productInCategory(product, cat) : false;
  });
}

export function coverImageForDisplayCategory(
  category: Category,
  products: Product[],
  allCategories: Category[]
): string | undefined {
  for (const slug of getCategoryGroupSlugs(category.slug)) {
    const cat = allCategories.find((c) => c.slug === slug);
    if (!cat) continue;
    const image = coverImageForCategory(cat, products);
    if (image) return image;
  }
  return coverImageForCategory(category, products);
}

export function groupProductsByDisplayCategory(
  products: Product[],
  categories: Category[]
): { category: Category; products: Product[] }[] {
  const display = getDisplayCategories(categories);

  return display
    .map((category) => ({
      category,
      products: products
        .filter((product) => productMatchesCategoryFilter(product, category.slug, categories))
        .sort((a, b) => a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en)),
    }))
    .filter((group) => group.products.length > 0);
}
