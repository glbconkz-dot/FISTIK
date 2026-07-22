import type { Category, Product } from '@/types';

/** Varsayılan kategori kapak görselleri (admin/DB boşsa) */
const CATEGORY_COVER_IMAGES: Record<string, string> = {
  'american-cakes': '/products/american-cakes/lotus.png',
  'eclairs-mini': '/products/eclairs/mini/category-cover.png',
};

/** Supabase UUID veya local slug ile eslesme */
export function productInCategory(product: Product, category: Category): boolean {
  const cid = product.category_id;
  if (!cid) return false;
  return cid === category.id || cid === category.slug;
}

export function coverImageForCategory(
  category: Category,
  products: Product[]
): string | undefined {
  const custom = category.image_url?.trim();
  if (custom) return custom;

  const preset = CATEGORY_COVER_IMAGES[category.slug];
  if (preset) return preset;

  return products.find((p) => productInCategory(p, category) && p.image_url)?.image_url;
}

export function productsInCategory(products: Product[], categorySlug: string): Product[] {
  return products.filter((p) => {
    const cat = p.categories as Category | null | undefined;
    if (cat?.slug === categorySlug) return true;
    return p.category_id === categorySlug;
  });
}
