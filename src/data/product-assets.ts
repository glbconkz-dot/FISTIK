import productAssets from '@/data/product-assets.json';
import type { Category, Product } from '@/types';

export interface ProductAsset {
  slugs?: string[];
  category?: string;
  names?: string[];
  exact?: boolean;
  image_url: string;
  /** Extra gallery images; image_url is always first/primary */
  image_urls?: string[];
  name_en?: string;
  name_ru?: string;
  name_kk?: string;
  name_tr?: string;
  description_en?: string;
  description_ru?: string;
  description_kk?: string;
  description_tr?: string;
}

export const PRODUCT_ASSETS = productAssets as ProductAsset[];

/** Text/name fields only — image_url handled separately so admin uploads win. */
const TEXT_MERGE_FIELDS = [
  'name_en',
  'name_ru',
  'name_kk',
  'name_tr',
  'description_en',
  'description_ru',
  'description_kk',
  'description_tr',
] as const;

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveCategorySlug(product: Product, categories?: Category[]): string | undefined {
  const joined = product.categories as Category | null | undefined;
  if (joined?.slug) return joined.slug;

  const categoryId = product.category_id;
  if (!categoryId) return undefined;

  const byId = categories?.find((category) => category.id === categoryId);
  if (byId?.slug) return byId.slug;

  const bySlug = categories?.find((category) => category.slug === categoryId);
  if (bySlug) return categoryId;

  return categoryId;
}

function namesMatch(product: Product, asset: ProductAsset): boolean {
  if (!asset.names?.length) return false;

  const productNames = [
    product.name_en,
    product.name_ru,
    product.name_kk,
    product.name_tr,
  ].map(normalizeName);

  return asset.names.some((needle) => {
    const normalizedNeedle = normalizeName(needle);
    return productNames.some((haystack) => {
      if (asset.exact) {
        return haystack === normalizedNeedle;
      }
      return (
        haystack === normalizedNeedle ||
        haystack.includes(normalizedNeedle) ||
        normalizedNeedle.includes(haystack)
      );
    });
  });
}

/** Admin / Supabase Storage (or any absolute URL) — must not be overwritten by static assets. */
export function isAdminOrRemoteProductImage(url: string | null | undefined): boolean {
  const value = url?.trim() ?? '';
  if (!value) return false;
  return /^https?:\/\//i.test(value) || value.includes('/storage/v1/object/public/');
}

export function findProductAsset(
  product: Product,
  categories?: Category[]
): ProductAsset | undefined {
  const categorySlug = resolveCategorySlug(product, categories);

  return PRODUCT_ASSETS.find((asset) => {
    if (asset.slugs?.length) {
      return asset.slugs.includes(product.slug);
    }

    if (asset.category && categorySlug !== asset.category) {
      return false;
    }

    return namesMatch(product, asset);
  });
}

export function applyProductAsset(
  product: Product,
  categories?: Category[]
): Product {
  const asset = findProductAsset(product, categories);
  if (!asset) return product;

  const updates: Partial<Product> = {};
  for (const field of TEXT_MERGE_FIELDS) {
    const value = asset[field];
    if (value !== undefined) {
      updates[field] = value;
    }
  }

  const gallery = getAssetGallery(asset);
  const dbImage = product.image_url?.trim() ?? '';

  // Admin-uploaded (or any remote) image always wins over product-assets.json
  if (isAdminOrRemoteProductImage(dbImage)) {
    return { ...product, ...updates };
  }

  if (gallery.length > 0) {
    updates.image_url = gallery[0];
    updates.image_urls = gallery.slice(1);
  } else if (asset.image_url !== undefined && !asset.image_url.trim()) {
    // Explicit empty in assets → clear broken/local static image
    updates.image_url = '';
    updates.image_urls = [];
  }

  return { ...product, ...updates };
}

function getAssetGallery(asset: ProductAsset): string[] {
  const urls = [asset.image_url, ...(asset.image_urls ?? [])]
    .map((u) => u?.trim())
    .filter((u): u is string => Boolean(u));
  return [...new Set(urls)];
}

export function applyProductAssets(
  products: Product[],
  categories?: Category[]
): Product[] {
  return products.map((product) => applyProductAsset(product, categories));
}
