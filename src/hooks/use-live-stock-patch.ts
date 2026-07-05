'use client';

import { useCallback, useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import type { Product } from '@/types';

/** Sekme odaklanınca stok/fiyat günceller — tam katalog çekmez */
export function useLiveStockPatch(products: Product[]): Product[] {
  const [patched, setPatched] = useState<Product[] | null>(null);

  const refresh = useCallback(async () => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const { data: rows, error } = await supabase
      .from('products')
      .select('id, slug, stock_quantity, price, is_active')
      .eq('is_active', true);

    if (error || !rows?.length) return;

    setPatched(
      products.map((product) => {
        const row = rows.find((r) => r.id === product.id || r.slug === product.slug);
        if (!row) return product;
        return {
          ...product,
          stock_quantity: Math.max(0, Number(row.stock_quantity ?? 0)),
          price: Number(row.price ?? product.price),
        };
      })
    );
  }, [products]);

  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  return patched ?? products;
}
