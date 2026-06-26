import { createClient } from '@/lib/supabase/server';
import { AdminProductForm } from '@/components/admin/AdminProductForm';
import type { Category } from '@/types';

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div>
      <h1 className="font-display mb-6 text-3xl font-bold">New product</h1>
      <AdminProductForm categories={(categories as Category[]) ?? []} />
    </div>
  );
}
