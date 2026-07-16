import { createClient } from '@/lib/supabase/server';
import { AdminCategoryList } from '@/components/admin/AdminCategoryList';
import { CoffeeCategoryNotice } from '@/components/admin/CoffeeCategoryNotice';
import { getDisplayCategories } from '@/lib/category-display';
import type { Category } from '@/types';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  const all = (categories as Category[]) ?? [];
  const visible = getDisplayCategories(all);

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Kategoriler</h1>
      <CoffeeCategoryNotice categories={all} />
      <AdminCategoryList categories={visible} />
    </div>
  );
}