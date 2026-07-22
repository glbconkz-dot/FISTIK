import { createClient } from '@/lib/supabase/server';
import { AdminCategoryList } from '@/components/admin/AdminCategoryList';
import { CoffeeCategoryNotice } from '@/components/admin/CoffeeCategoryNotice';
import { applyProductAssets } from '@/data/product-assets';
import { getDisplayCategories } from '@/lib/category-display';
import type { Category, Product } from '@/types';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  const all = (categories as Category[]) ?? [];
  const visible = getDisplayCategories(all);
  const withAssets = applyProductAssets((products as Product[]) ?? [], all);

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Kategoriler</h1>
      <CoffeeCategoryNotice categories={all} />
      <AdminCategoryList
        categories={visible}
        allCategories={all}
        products={withAssets}
      />
    </div>
  );
}
