'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, getAdminUser } from '@/lib/supabase/server';
import { revalidateStorefront } from '@/lib/revalidate-storefront';
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
  if (productId) {
    revalidatePath(`/admin/products/${productId}/edit`);
  }
  revalidateStorefront();
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
    revalidateStorefront();
    return { ok: true, stock: nextStock };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Stok güncellenemedi' };
  }
}

export async function setProductPrice(
  productId: string,
  price: number
): Promise<{ ok: true; price: number } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const nextPrice = Math.max(0, Math.min(9_999_999, Math.round(price)));

    const { error } = await supabase
      .from('products')
      .update({ price: nextPrice })
      .eq('id', productId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidateStorefront();
    return { ok: true, price: nextPrice };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Fiyat kaydedilemedi' };
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
    revalidateStorefront();
    return { ok: true, stock: nextStock };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Stok kaydedilemedi' };
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
  revalidateStorefront();
}

export async function deleteProduct(
  productId: string,
  pin: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();

    const expectedPin = process.env.PRODUCT_DELETE_PIN?.trim();
    if (!expectedPin || !/^\d{4}$/.test(expectedPin)) {
      return {
        ok: false,
        error: 'Silme kodu sunucuda ayarlı değil. .env.local → PRODUCT_DELETE_PIN=1234',
      };
    }

    if (pin.trim() !== expectedPin) {
      return { ok: false, error: 'Yanlış silme kodu.' };
    }

    const supabase = await createClient();
    const { error } = await supabase.from('products').delete().eq('id', productId);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/admin/products');
    revalidateStorefront();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Silinemedi' };
  }
}

export async function uploadProductImage(formData: FormData): Promise<{ url: string }> {
  await requireAdmin();

  const file = formData.get('file') as File | null;
  if (!file || typeof file === 'string' || file.size === 0) {
    throw new Error('Dosya seçilmedi');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Sadece resim dosyası yükleyin');
  }

  const { tryCreateServiceClient } = await import('@/lib/supabase/service');
  const supabase = tryCreateServiceClient() ?? (await createClient());

  const ext =
    (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(fileName, buffer, {
      contentType: file.type || `image/${ext}`,
      upsert: true,
      cacheControl: '3600',
    });

  if (uploadError) {
    throw new Error(
      uploadError.message.includes('Bucket not found')
        ? 'Supabase Storage: product-images bucket yok. Storage’da public bucket oluşturun.'
        : uploadError.message
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(fileName);

  if (!publicUrl) {
    throw new Error('Yükleme URL’si alınamadı');
  }

  return { url: publicUrl };
}

export async function upsertCategory(data: {
  slug: string;
  nameEn: string;
  nameRu: string;
  nameKk: string;
  nameTr: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl?: string;
  showOnHome?: boolean;
  categoryId?: string;
}) {
  await requireAdmin();
  const supabase = await createClient();

  const payload = {
    slug: data.slug || slugify(data.nameEn),
    name_en: data.nameEn,
    name_ru: data.nameRu,
    name_kk: data.nameKk,
    name_tr: data.nameTr,
    sort_order: data.sortOrder,
    is_active: data.isActive,
    image_url: data.imageUrl ?? '',
    show_on_home: data.showOnHome ?? true,
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

  revalidatePath('/admin/categories');
  revalidatePath('/admin/products');
  revalidateStorefront();
}

export async function uploadCategoryImage(formData: FormData): Promise<{ url: string }> {
  return uploadProductImage(formData);
}
