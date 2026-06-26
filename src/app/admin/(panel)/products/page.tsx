import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductList } from '@/components/admin/ProductList';
import type { Product } from '@/types';

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Ürünler</h1>
          <p className="text-muted">Adet yaz → Kaydet · veya +/− · sabah toplu 30</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary shrink-0">
          Add product
        </Link>
      </div>
      <ProductList products={(products as Product[]) ?? []} />
    </div>
  );
}
