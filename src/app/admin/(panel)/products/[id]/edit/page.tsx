import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminProductForm } from '@/components/admin/AdminProductForm';
import type { Category, Product } from '@/types';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display mb-6 text-3xl font-bold">Edit product</h1>
      <AdminProductForm
        product={product as Product}
        categories={(categories as Category[]) ?? []}
      />
    </div>
  );
}
