'use server';

import { revalidateTag } from 'next/cache';
import { isB2BAdminGateOpen } from '@/app/actions/b2b-admin';
import { tryCreateServiceClient } from '@/lib/supabase/service';
import type { Product } from '@/types';

interface PriceResult {
  ok: true;
  price: number;
}

interface PriceError {
  ok: false;
  error: string;
}

export type SetB2BPriceResult = PriceResult | PriceError;

export async function listProductsForB2BPricing(): Promise<{
  products: Product[];
  b2bPrices: Record<string, number>;
}> {
  if (!(await isB2BAdminGateOpen())) {
    return { products: [], b2bPrices: {} };
  }

  const supabase = tryCreateServiceClient();
  if (!supabase) return { products: [], b2bPrices: {} };

  const [productsResult, pricesResult] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, slug, category_id, name_en, name_ru, name_kk, name_tr, description_en, description_ru, description_kk, description_tr, price, image_url, is_active, stock_quantity, sort_order, created_at'
      )
      .order('sort_order', { ascending: true }),
    supabase.from('b2b_product_prices').select('product_id, price'),
  ]);

  if (productsResult.error) {
    console.error('listProductsForB2BPricing:', productsResult.error.message);
    return { products: [], b2bPrices: {} };
  }

  const b2bPrices: Record<string, number> = {};
  for (const row of pricesResult.data ?? []) {
    b2bPrices[row.product_id as string] = Number(row.price);
  }

  return {
    products: (productsResult.data as Product[]) ?? [],
    b2bPrices,
  };
}

export async function setB2BProductPrice(
  productId: string,
  price: number
): Promise<SetB2BPriceResult> {
  if (!(await isB2BAdminGateOpen())) {
    return { ok: false, error: 'unauthorized' };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: 'invalidPrice' };
  }

  const supabase = tryCreateServiceClient();
  if (!supabase) {
    return { ok: false, error: 'setup' };
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from('b2b_product_prices').upsert(
    {
      product_id: productId,
      price,
      updated_at: now,
    },
    { onConflict: 'product_id' }
  );

  if (error) {
    console.error('setB2BProductPrice:', error.message);
    return { ok: false, error: error.message };
  }

  revalidateTag('b2b-catalog');
  return { ok: true, price };
}

export async function clearB2BProductPrice(productId: string): Promise<SetB2BPriceResult> {
  if (!(await isB2BAdminGateOpen())) {
    return { ok: false, error: 'unauthorized' };
  }

  const supabase = tryCreateServiceClient();
  if (!supabase) {
    return { ok: false, error: 'setup' };
  }

  const { error } = await supabase.from('b2b_product_prices').delete().eq('product_id', productId);

  if (error) {
    console.error('clearB2BProductPrice:', error.message);
    return { ok: false, error: error.message };
  }

  revalidateTag('b2b-catalog');
  return { ok: true, price: 0 };
}
