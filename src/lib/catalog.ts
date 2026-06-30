import { applyProductAssets, applyProductAsset } from '@/data/product-assets';
import { DEFAULT_MENU_STOCK, getLocalCatalog } from '@/data/menu';
import { tryCreateClient } from '@/lib/supabase/server';
import type { Category, Locale, Product } from '@/types';

function withFallbackStock(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    stock_quantity:
      Number(p.stock_quantity ?? 0) > 0
        ? Number(p.stock_quantity)
        : DEFAULT_MENU_STOCK,
  }));
}

export async function getCatalogData(): Promise<{
  categories: Category[];
  products: Product[];
  source: 'supabase' | 'local';
}> {
  const local = getLocalCatalog();
  const supabase = await tryCreateClient();

  if (!supabase) {
    return {
      categories: local.categories,
      products: withFallbackStock(local.products),
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

  if (productsResult.error) {
    console.error('[catalog] Supabase products:', productsResult.error.message);
  }

  const products = (productsResult.data as Product[] | null) ?? [];
  const categories = (categoriesResult.data as Category[] | null) ?? [];

  // Supabase bağlı ve ürün var → DB kaynağı (stok 0 olsa bile admin stokunu yansıt)
  if (!productsResult.error && products.length > 0) {
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

  // DB boş veya hata — yerel menü (geliştirme / migration öncesi)
  return {
    categories: local.categories,
    products: withFallbackStock(local.products),
    source: 'local',
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await tryCreateClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && data) {
      const product = data as Product;
      const categories = product.categories
        ? [product.categories as Category]
        : undefined;
      return applyProductAsset(product, categories);
    }
  }

  const { products } = getLocalCatalog();
  const local = products.find((p) => p.slug === slug);
  if (!local) return null;
  return withFallbackStock([local])[0];
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
