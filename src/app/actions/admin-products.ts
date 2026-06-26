'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, getAdminUser } from '@/lib/supabase/server';
import { slugify } from '@/lib/utils';
import type { ProductFormData } from '@/types';

async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}

export async function upsertProduct(data: ProductFormData, productId?: string) {
  await requireAdmin();
  const supabase = await createClient();

  const payload = {
    slug: data.slug || slugify(data.nameEn),
    category_id: data.categoryId || null,
    name_en: data.nameEn,
    name_ru: data.nameRu,
    name_kk: data.nameKk,
    name_tr: data.nameTr,
    description_en: data.descriptionEn,
    description_ru: data.descriptionRu,
    description_kk: data.descriptionKk,
    description_tr: data.descriptionTr,
    price: data.price,
    image_url: data.imageUrl,
    is_active: data.isActive,
    stock_quantity: Math.max(0, data.stockQuantity ?? 0),
    sort_order: data.sortOrder,
  };

  if (productId) {
    const { error } = await supabase.from('products').update(payload).eq('id', productId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('products').insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function adjustProductStock(
  productId: string,
  delta: number
): Promise<{ ok: true; stock: number } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      return { ok: false, error: fetchError?.message ?? 'Ürün bulunamadı' };
    }

    const nextStock = Math.max(0, Number(product.stock_quantity ?? 0) + delta);

    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: nextStock })
      .eq('id', productId);

    if (error) {
      return { ok: false, error: formatStockError(error.message) };
    }

    revalidatePath('/admin/products');
    revalidatePath('/', 'layout');
    return { ok: true, stock: nextStock };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Stok güncellenemedi' };
  }
}

export async function setProductStock(
  productId: string,
  stockQuantity: number
): Promise<{ ok: true; stock: number } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const nextStock = Math.max(0, Math.min(9999, Math.floor(stockQuantity)));

    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: nextStock })
      .eq('id', productId);

    if (error) {
      return { ok: false, error: formatStockError(error.message) };
    }

    revalidatePath('/admin/products');
    revalidatePath('/', 'layout');
    return { ok: true, stock: nextStock };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Stok kaydedilemedi' };
  }
}

export async function setAllProductStock(
  stockQuantity: number
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const nextStock = Math.max(0, Math.min(9999, Math.floor(stockQuantity)));

    const { data, error } = await supabase
      .from('products')
      .update({ stock_quantity: nextStock })
      .select('id');

    if (error) {
      return { ok: false, error: formatStockError(error.message) };
    }

    revalidatePath('/admin/products');
    revalidatePath('/', 'layout');
    return { ok: true, count: data?.length ?? 0 };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Toplu stok güncellenemedi' };
  }
}

function formatStockError(message: string): string {
  if (message.includes('stock_quantity')) {
    return 'Veritabanında stock_quantity sütunu yok. Supabase SQL Editor\'de 006_stock_quantity.sql çalıştırın.';
  }
  return message;
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/products');
}

export async function uploadProductImage(formData: FormData): Promise<{ url: string }> {
  await requireAdmin();
  const supabase = await createClient();
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, { upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(fileName);

  return { url: publicUrl };
}

export async function upsertCategory(data: {
  slug: string;
  nameEn: string;
  nameRu: string;
  nameKk: string;
  sortOrder: number;
  isActive: boolean;
  categoryId?: string;
}) {
  await requireAdmin();
  const supabase = await createClient();

  const payload = {
    slug: data.slug || slugify(data.nameEn),
    name_en: data.nameEn,
    name_ru: data.nameRu,
    name_kk: data.nameKk,
    sort_order: data.sortOrder,
    is_active: data.isActive,
  };

  if (data.categoryId) {
    const { error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', data.categoryId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from('categories').insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath('/admin/products');
}
