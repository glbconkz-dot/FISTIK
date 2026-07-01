import { unstable_noStore as noStore } from 'next/cache';
import { applyProductAssets, applyProductAsset } from '@/data/product-assets';
import { getLocalCatalog } from '@/data/menu';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { getLocalizedName } from '@/lib/utils';
import type { Category, Locale, Product, StorefrontSection } from '@/types';

function normalizeStock(product: Product): Product {
  return {
    ...product,
    stock_quantity: Math.max(0, Number(product.stock_quantity ?? 0)),
  };
}

export type CatalogSource = 'supabase' | 'local' | 'missing';

async function fetchActiveCategories(
  supabase: NonNullable<ReturnType<typeof createPublicSupabaseClient>>
): Promise<Category[]> {
  const fullSelect =
    'id, slug, name_en, name_ru, name_kk, name_tr, sort_order, is_active, image_url, show_on_home, created_at';
  const basicSelect =
    'id, slug, name_en, name_ru, name_kk, name_tr, sort_order, is_active, created_at';

  const full = await supabase
    .from('categories')
    .select(fullSelect)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  let rows = (full.data as Category[] | null) ?? null;

  if (full.error) {
    console.error('[catalog] categories (full):', full.error.message);
    const basic = await supabase
      .from('categories')
      .select(basicSelect)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (basic.error) {
      console.error('[catalog] categories (basic):', basic.error.message);
      return [];
    }

    rows = (basic.data as Category[] | null) ?? null;
  }

  return (rows ?? []).map((category) => ({
    ...category,
    image_url: category.image_url ?? '',
    show_on_home: category.show_on_home ?? true,
  }));
}

export async function getCatalogData(): Promise<{
  categories: Category[];
  products: Product[];
  storefrontSections: StorefrontSection[];
  storefrontError: string | null;
  source: CatalogSource;
}> {
  noStore();
  const env = getSupabaseEnv();
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    if (env.isConfigured) {
      console.error('[catalog] Supabase env set but client failed');
    }
    if (process.env.NODE_ENV === 'production') {
      return { categories: [], products: [], storefrontSections: [], storefrontError: null, source: 'missing' };
    }
    const local = getLocalCatalog();
    return {
      categories: local.categories,
      products: local.products.map(normalizeStock),
      storefrontSections: [],
      storefrontError: null,
      source: 'local',
    };
  }

  const [productsResult, categoriesResult, sectionsResult] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, slug, category_id, name_en, name_ru, name_kk, name_tr, description_en, description_ru, description_kk, description_tr, price, image_url, is_active, stock_quantity, sort_order, created_at'
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    fetchActiveCategories(supabase),
    supabase.from('storefront_sections').select('key, product_ids, product_slugs, updated_at'),
  ]);

  const categories = categoriesResult;

  if (sectionsResult.error) {
    console.error('[catalog] storefront_sections:', sectionsResult.error.message);
  }

  const storefrontSections = ((sectionsResult.data as StorefrontSection[] | null) ?? []).map(
    (row) => ({
      key: row.key,
      product_ids: row.product_ids ?? [],
      product_slugs: row.product_slugs ?? [],
      updated_at: row.updated_at,
    })
  );

  if (productsResult.error) {
    console.error('[catalog] Supabase products:', productsResult.error.message);
    return { categories, products: [], storefrontSections, storefrontError: sectionsResult.error?.message ?? null, source: 'supabase' };
  }

  const products = ((productsResult.data as Product[] | null) ?? []).map(normalizeStock);

  if (products.length === 0) {
    return { categories, products: [], storefrontSections, storefrontError: sectionsResult.error?.message ?? null, source: 'supabase' };
  }

  const categoryOrder = new Map(categories.map((c) => [c.id, c.sort_order]));
  const sortedProducts = [...products].sort((a, b) => {
    const catA = categoryOrder.get(a.category_id ?? '') ?? 999;
    const catB = categoryOrder.get(b.category_id ?? '') ?? 999;
    if (catA !== catB) return catA - catB;
    return a.sort_order - b.sort_order;
  });

  return {
    products: applyProductAssets(sortedProducts, categories),
    categories,
    storefrontSections,
    storefrontError: sectionsResult.error?.message ?? null,
    source: 'supabase',
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  noStore();
  const supabase = createPublicSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && data) {
      const product = normalizeStock(data as Product);
      const categories = product.categories
        ? [product.categories as Category]
        : undefined;
      return applyProductAsset(product, categories);
    }
    return null;
  }

  if (process.env.NODE_ENV === 'production') return null;

  const { products } = getLocalCatalog();
  const local = products.find((p) => p.slug === slug);
  return local ? normalizeStock(local) : null;
}

export function getCategoryName(
  product: Product,
  categories: Category[],
  locale: Locale
): string {
  const fromJoin = product.categories as Category | null | undefined;
  if (fromJoin) return getLocalizedName(fromJoin, locale);

  const catId = product.category_id;
  const cat = categories.find((c) => c.id === catId || c.slug === catId);
  return cat ? getLocalizedName(cat, locale) : '';
}
