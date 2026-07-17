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

  const PRODUCT_SELECT_WITH_GALLERY =
    'id, slug, category_id, name_en, name_ru, name_kk, name_tr, description_en, description_ru, description_kk, description_tr, price, image_url, image_urls, is_active, stock_quantity, sort_order, created_at';
  const PRODUCT_SELECT_BASIC =
    'id, slug, category_id, name_en, name_ru, name_kk, name_tr, description_en, description_ru, description_kk, description_tr, price, image_url, is_active, stock_quantity, sort_order, created_at';

  let productsRows: Product[] | null = null;
  let productsError: string | null = null;

  {
    const withGallery = await supabase
      .from('products')
      .select(PRODUCT_SELECT_WITH_GALLERY)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!withGallery.error) {
      productsRows = withGallery.data as Product[] | null;
    } else if (String(withGallery.error.message).includes('image_urls')) {
      const basic = await supabase
        .from('products')
        .select(PRODUCT_SELECT_BASIC)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (basic.error) productsError = basic.error.message;
      else productsRows = basic.data as Product[] | null;
    } else {
      productsError = withGallery.error.message;
    }
  }

  const [categoriesResult, sectionsResult, clearanceResult] = await Promise.all([
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

  if (productsError) {
    console.error('[catalog] Supabase products:', productsError);
    return {
      categories,
      products: [],
      storefrontSections,
      clearanceRules: clearanceResult,
      storefrontError: sectionsResult.error?.message ?? null,
      source: 'supabase',
    };
  }

  const products = (productsRows ?? []).map(normalizeStock);

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

const PRODUCT_DETAIL_SELECT =
  'id, slug, category_id, name_en, name_ru, name_kk, name_tr, description_en, description_ru, description_kk, description_tr, price, image_url, image_urls, is_active, stock_quantity, sort_order, created_at, categories(id, slug, name_en, name_ru, name_kk, name_tr, sort_order, is_active, created_at)';

const PRODUCT_DETAIL_SELECT_BASIC =
  'id, slug, category_id, name_en, name_ru, name_kk, name_tr, description_en, description_ru, description_kk, description_tr, price, image_url, is_active, stock_quantity, sort_order, created_at, categories(id, slug, name_en, name_ru, name_kk, name_tr, sort_order, is_active, created_at)';

async function loadProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createPublicSupabaseClient();

  if (!supabase) {
    if (process.env.NODE_ENV === 'production') return null;
    const { products } = getLocalCatalog();
    const local = products.find((p) => p.slug === slug);
    return local ? normalizeStock(local) : null;
  }

  let { data, error } = await supabase
    .from('products')
    .select(PRODUCT_DETAIL_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error && String(error.message).includes('image_urls')) {
    ({ data, error } = await supabase
      .from('products')
      .select(PRODUCT_DETAIL_SELECT_BASIC)
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle());
  }

  if (error || !data) return null;

  const row = data as Product & { categories?: Category | Category[] | null };
  const joined = row.categories;
  const category =
    Array.isArray(joined) ? joined[0] ?? null : joined ?? null;

  const product = normalizeStock({ ...row, categories: category });
  const categories = category ? [category] : undefined;
  return applyProductAsset(product, categories);
}

const getCachedProductBySlug = unstable_cache(
  async (slug: string) => loadProductBySlug(slug),
  ['fistik-product'],
  {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: ['catalog'],
  }
);

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await getCachedProductBySlug(slug);
  if (!product) return null;

  const { clearanceRules } = await getCachedCatalogData();
  const rule = clearanceRules.find((r) => r.product_slug === slug);
  return applyClearanceToProduct(product, rule);
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

/** Menu filter slug for “back to category” (frozen-boreks → semi-finished). */
export function getCategoryFilterSlug(
  product: Product,
  categories: Category[]
): string | null {
  const fromJoin = product.categories as Category | null | undefined;
  let slug = fromJoin?.slug ?? null;

  if (!slug) {
    const catId = product.category_id;
    const cat = categories.find((c) => c.id === catId || c.slug === catId);
    slug = cat?.slug ?? (typeof catId === 'string' ? catId : null);
  }

  if (!slug) return null;
  return slug === 'frozen-boreks' ? 'semi-finished' : slug;
}
