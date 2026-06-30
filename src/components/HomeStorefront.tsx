'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchLiveCatalog } from '@/app/actions/catalog';
import { HomeExperience } from '@/components/HomeExperience';
import type { Category, Locale, Product, StorefrontSection } from '@/types';

interface HomeStorefrontProps {
  products: Product[];
  categories: Category[];
  storefrontSections: StorefrontSection[];
  locale: Locale;
}

export function HomeStorefront({
  products: initialProducts,
  categories: initialCategories,
  storefrontSections: initialSections,
  locale,
}: HomeStorefrontProps) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [sections, setSections] = useState(initialSections);

  useEffect(() => {
    setProducts(initialProducts);
    setCategories(initialCategories);
    setSections(initialSections);
  }, [initialProducts, initialCategories, initialSections]);

  const refreshStorefront = useCallback(async () => {
    try {
      const data = await fetchLiveCatalog();
      if (data.products.length > 0) setProducts(data.products);
      if (data.categories.length > 0) setCategories(data.categories);
      if (data.storefrontError) return;
      setSections(data.storefrontSections);
    } catch {
      /* keep SSR data */
    }
  }, []);

  useEffect(() => {
    refreshStorefront();
    const onFocus = () => refreshStorefront();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshStorefront]);

  return (
    <HomeExperience
      products={products}
      categories={categories}
      storefrontSections={sections}
      locale={locale}
    />
  );
}
