import { createClient } from '@/lib/supabase/server';
import { ProductList } from '@/components/admin/ProductList';
import { applyProductAssets } from '@/data/product-assets';
import type { Category, Product } from '@/types';

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').order('sort_order', { ascending: true }),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
  ]);

  const cats = (categories as Category[]) ?? [];
  const withAssets = applyProductAssets((products as Product[]) ?? [], cats);

  return <ProductList products={withAssets} categories={cats} />;
}
