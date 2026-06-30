import { unstable_noStore as noStore } from 'next/cache';
import { applyProductAssets, applyProductAsset } from '@/data/product-assets';
import { getLocalCatalog } from '@/data/menu';
import { tryCreateClient } from '@/lib/supabase/server';
import type { Category, Locale, Product } from '@/types';

function normalizeStock(product: Product): Product {
  return {
    ...product,
    stock_quantity: Math.max(0, Number(product.stock_quantity ?? 0)),
  };
}

export async function getCatalogData(): Promise<{
  categories: Category[];
  products: Product[];
  source: 'supabase' | 'local';
}> {
  noStore();
  const local = getLocalCatalog();
  const supabase = await tryCreateClient();

  // Supabase yok — sadece geliştirme (yerel menü)
  if (!supabase) {
    return {
      categories: local.categories,
      products: local.products.map(normalizeStock),
      source: 'local',
    };
  }

  const [productsResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  const categories = (categoriesResult.data as Category[] | null) ?? [];

  if (productsResult.error) {
    console.error('[catalog] Supabase products:', productsResult.error.message);
    return { categories, products: [], source: 'supabase' };
  }

  const products = ((productsResult.data as Product[] | null) ?? []).map(normalizeStock);

  if (products.length === 0) {
    return { categories, products: [], source: 'supabase' };
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
    source: 'supabase',
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  noStore();
  const supabase = await tryCreateClient();

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
  if (fromJoin) return fromJoin[`name_${locale}`];

  const catId = product.category_id;
  const cat = categories.find((c) => c.id === catId || c.slug === catId);
  return cat ? cat[`name_${locale}`] : '';
}
