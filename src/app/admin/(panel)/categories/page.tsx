import { createClient } from '@/lib/supabase/server';
import { AdminCategoryList } from '@/components/admin/AdminCategoryList';
import type { Category } from '@/types';

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Kategoriler</h1>
      <AdminCategoryList categories={(categories as Category[]) ?? []} />
    </div>
  );
}
