import { unstable_cache } from 'next/cache';
import { applyProductAssets, applyProductAsset } from '@/data/product-assets';
import { CATALOG_REVALIDATE_SECONDS } from '@/lib/cache-config';
import { applyClearanceToProduct, applyClearanceToProducts } from '@/lib/b2c/clearance';
import { getLocalCatalog } from '@/data/menu';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { createPublicSupabaseClient } from '@/lib/supabase/public';
import { getLocalizedName } from '@/lib/utils';
import type { Category, ClearanceRule, Locale, Product, StorefrontSection } from '@/types';

function normalizeStock(product: Product): Product {
  return {
    ...product,
    stock_quantity: Math.max(0, Number(product.stock_quantity ?? 0)),
  };
}

export type CatalogSource = 'supabase' | 'local' | 'missing';

const CATEGORY_BASE_SELECT =
  'id, slug, name_en, name_ru, name_kk, name_tr, sort_order, is_active, created_at';

function isMissingColumnError(message: string): boolean {
  return message.includes('does not exist') || message.includes('image_url') || message.includes('show_on_home');
}

function normalizeCategories(rows: Category[] | null): Category[] {
  return (rows ?? []).map((category) => ({
    ...category,
    image_url: category.image_url ?? '',
    show_on_home: category.show_on_home ?? true,
  }));
}

async function fetchActiveCategories(
  supabase: NonNullable<ReturnType<typeof createPublicSupabaseClient>>
): Promise<Category[]> {
  const fullSelect = `${CATEGORY_BASE_SELECT}, image_url, show_on_home`;

  const full = await supabase
    .from('categories')
    .select(fullSelect)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (!full.error) {
    return normalizeCategories(full.data as Category[] | null);
  }

  if (!isMissingColumnError(full.error.message)) {
    console.error('[catalog] categories:', full.error.message);
    return [];
  }

  const basic = await supabase
    .from('categories')
    .select(CATEGORY_BASE_SELECT)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (basic.error) {
    console.error('[catalog] categories (basic):', basic.error.message);
    return [];
  }

  return normalizeCategories(basic.data as Category[] | null);
}

async function fetchClearanceRules(
  supabase: NonNullable<ReturnType<typeof createPublicSupabaseClient>>
): Promise<ClearanceRule[]> {
  const { data, error } = await supabase
    .from('storefront_clearance')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    if (!error.message.includes('storefront_clearance') && !error.message.includes('does not exist')) {
      console.error('[catalog] storefront_clearance:', error.message);
    }
    return [];
  }

  return (data as ClearanceRule[]) ?? [];
}

async function loadCatalogData(): Promise<{
  categories: Category[];
  products: Product[];
  storefrontSections: StorefrontSection[];
  clearanceRules: ClearanceRule[];
  storefrontError: string | null;
  source: CatalogSource;
}> {
  const env = getSupabaseEnv();
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    if (env.isConfigured) {
      console.error('[catalog] Supabase env set but client failed');
    }
    if (process.env.NODE_ENV === 'production') {
      return {
        categories: [],
        products: [],
        storefrontSections: [],
        clearanceRules: [],
        storefrontError: null,
        source: 'missing',
      };
    }
    const local = getLocalCatalog();
    return {
      categories: local.categories,
      products: local.products.map(normalizeStock),
      storefrontSections: [],
      clearanceRules: [],
      storefrontError: null,
      source: 'local',
    };
  }

  const [productsResult, categoriesResult, sectionsResult, clearanceResult] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, slug, category_id, name_en, name_ru, name_kk, name_tr, description_en, description_ru, description_kk, description_tr, price, image_url, is_active, stock_quantity, sort_order, created_at'
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    fetchActiveCategories(supabase),
    supabase.from('storefront_sections').select('key, product_ids, product_slugs, updated_at'),
    fetchClearanceRules(supabase),
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
    return {
      categories,
      products: [],
      storefrontSections,
      clearanceRules: clearanceResult,
      storefrontError: sectionsResult.error?.message ?? null,
      source: 'supabase',
    };
  }

  const products = ((productsResult.data as Product[] | null) ?? []).map(normalizeStock);

  if (products.length === 0) {
    return {
      categories,
      products: [],
      storefrontSections,
      clearanceRules: clearanceResult,
      storefrontError: sectionsResult.error?.message ?? null,
      source: 'supabase',
    };
  }

  const categoryOrder = new Map(categories.map((c) => [c.id, c.sort_order]));
  const sortedProducts = [...products].sort((a, b) => {
    const catA = categoryOrder.get(a.category_id ?? '') ?? 999;
    const catB = categoryOrder.get(b.category_id ?? '') ?? 999;
    if (catA !== catB) return catA - catB;
    return a.sort_order - b.sort_order;
  });

  const withAssets = applyProductAssets(sortedProducts, categories);

  // Do NOT apply time-window clearance here — this result is cached.
  // getCatalogData() applies clearance with the current Almaty time after cache.
  return {
    products: withAssets,
    categories,
    storefrontSections,
    clearanceRules: clearanceResult,
    storefrontError: sectionsResult.error?.message ?? null,
    source: 'supabase',
  };
}

const getCachedCatalogData = unstable_cache(loadCatalogData, ['fistik-catalog'], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: ['catalog'],
});

export async function getCatalogData() {
  const supabase = createPublicSupabaseClient();
  const data =
    !supabase && process.env.NODE_ENV !== 'production'
      ? await loadCatalogData()
      : await getCachedCatalogData();

  return {
    ...data,
    products: applyClearanceToProducts(data.products, data.clearanceRules),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
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
      const withAsset = applyProductAsset(product, categories);

      const clearanceRules = await fetchClearanceRules(supabase);
      const rule = clearanceRules.find((r) => r.product_slug === slug);
      return applyClearanceToProduct(withAsset, rule);
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
