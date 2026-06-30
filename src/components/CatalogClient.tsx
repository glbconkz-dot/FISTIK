'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchLiveCatalog } from '@/app/actions/catalog';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { ProductCard } from '@/components/ProductCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import type { Category, Product } from '@/types';
import type { Locale } from '@/types';

interface CatalogClientProps {
  products: Product[];
  categories: Category[];
  locale: Locale;
}

export function CatalogClient({ products, categories, locale }: CatalogClientProps) {
  const t = useTranslations('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [liveProducts, setLiveProducts] = useState(products);
  const [liveCategories, setLiveCategories] = useState(categories);

  const refreshCatalog = useCallback(async () => {
    try {
      const data = await fetchLiveCatalog();
      if (data.products.length > 0) {
        setLiveProducts(data.products);
        setLiveCategories(data.categories);
        return;
      }
    } catch {
      /* server action failed — try browser Supabase */
    }

    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const { data: rows, error } = await supabase
      .from('products')
      .select('id, slug, stock_quantity, price, is_active')
      .eq('is_active', true);

    if (error || !rows?.length) return;

    setLiveProducts((prev) =>
      prev.map((product) => {
        const row = rows.find((r) => r.id === product.id || r.slug === product.slug);
        if (!row) return product;
        return {
          ...product,
          stock_quantity: Math.max(0, Number(row.stock_quantity ?? 0)),
          price: Number(row.price ?? product.price),
        };
      })
    );
  }, []);

  useEffect(() => {
    setLiveProducts(products);
    setLiveCategories(categories);
  }, [products, categories]);

  useEffect(() => {
    refreshCatalog();
    const onFocus = () => refreshCatalog();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshCatalog]);

  const filtered = selectedCategory
    ? liveProducts.filter((p) => {
        const cat = liveCategories.find((c) => c.id === p.category_id);
        return cat?.slug === selectedCategory;
      })
    : liveProducts;

  return (
    <>
      <CategoryFilter
        categories={liveCategories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        locale={locale}
        allLabel={t('allCategories')}
      />

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted">{t('empty')}</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      )}
    </>
  );
}
