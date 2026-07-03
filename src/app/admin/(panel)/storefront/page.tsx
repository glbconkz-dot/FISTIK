import { createClient } from '@/lib/supabase/server';
import { AdminStorefrontEditor } from '@/components/admin/AdminStorefrontEditor';
import type { Category, Product, StorefrontSection } from '@/types';

export default async function AdminStorefrontPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }, { data: sections }] = await Promise.all([
    supabase.from('products').select('*').order('sort_order', { ascending: true }),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('storefront_sections').select('key, product_ids, product_slugs, updated_at'),
  ]);

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-bold">Ana Sayfa Vitrini</h1>
      <AdminStorefrontEditor
        products={(products as Product[]) ?? []}
        categories={(categories as Category[]) ?? []}
        sections={(sections as StorefrontSection[]) ?? []}
      />
    </div>
  );
}
