'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchLiveCatalog } from '@/app/actions/catalog';
import { HomeCover } from '@/components/HomeCover';
import type { Locale, Product, StorefrontSection } from '@/types';

interface HomeStorefrontProps {
  products: Product[];
  storefrontSections: StorefrontSection[];
  locale: Locale;
  fullPage?: boolean;
}

export function HomeStorefront({
  products: serverProducts,
  storefrontSections: serverSections,
  locale,
  fullPage = false,
}: HomeStorefrontProps) {
  const [liveData, setLiveData] = useState<{
    products: Product[];
    sections: StorefrontSection[];
  } | null>(null);

  const products = liveData?.products ?? serverProducts;
  const sections = liveData?.sections ?? serverSections;

  const refreshStorefront = useCallback(async () => {
    try {
      const data = await fetchLiveCatalog();
      if (data.storefrontError && data.products.length === 0) return;
      setLiveData({
        products: data.products.length > 0 ? data.products : serverProducts,
        sections: data.storefrontSections,
      });
    } catch {
      /* SSR verisi kalir */
    }
  }, [serverProducts]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void refreshStorefront();
    });
    const onFocus = () => void refreshStorefront();
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshStorefront]);

  return (
    <HomeCover
      products={products}
      storefrontSections={sections}
      locale={locale}
      fullPage={fullPage}
    />
  );
}
