import { createClient } from '@/lib/supabase/server';
import { ProductList } from '@/components/admin/ProductList';
import type { Product } from '@/types';

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  return <ProductList products={(products as Product[]) ?? []} />;
}
