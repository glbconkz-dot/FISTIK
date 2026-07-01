'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { fetchLiveCatalog } from '@/app/actions/catalog';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser';
import { ProductCard } from '@/components/ProductCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { productMatchesCategoryFilter } from '@/lib/category-display';
import type { Category, Product } from '@/types';
import type { Locale } from '@/types';

export function normalizeCategoryParam(cat: string | null): string | null {
  if (!cat) return null;
  return cat === 'frozen-boreks' ? 'semi-finished' : cat;
}

interface CatalogClientProps {
  products: Product[];
  categories: Category[];
  locale: Locale;
}

export function CatalogClient({ products, categories, locale }: CatalogClientProps) {
  const t = useTranslations('catalog');
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = normalizeCategoryParam(searchParams.get('cat'));

  const [catalogPatch, setCatalogPatch] = useState<{
    products?: Product[];
    categories?: Category[];
  } | null>(null);

  const liveProducts = catalogPatch?.products ?? products;
  const liveCategories = catalogPatch?.categories ?? categories;

  const selectCategory = useCallback(
    (slug: string | null) => {
      if (slug) {
        router.replace({ pathname: '/menu', query: { cat: slug } });
      } else {
        router.replace('/menu');
      }
    },
    [router]
  );

  const refreshCatalog = useCallback(async () => {
    try {
      const data = await fetchLiveCatalog();
      if (data.products.length > 0) {
        setCatalogPatch({
          products: data.products,
          categories: data.categories,
        });
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

    setCatalogPatch({
      products: products.map((product) => {
        const row = rows.find((r) => r.id === product.id || r.slug === product.slug);
        if (!row) return product;
        return {
          ...product,
          stock_quantity: Math.max(0, Number(row.stock_quantity ?? 0)),
          price: Number(row.price ?? product.price),
        };
      }),
    });
  }, [products]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void refreshCatalog();
    });
    const onFocus = () => void refreshCatalog();
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshCatalog]);

  const filtered = selectedCategory
    ? liveProducts.filter((p) =>
        productMatchesCategoryFilter(p, selectedCategory, liveCategories)
      )
    : liveProducts;

  return (
    <section id="all-products" className="mt-10 scroll-mt-24">
      <h2 className="section-title mb-5">{t('allProducts')}</h2>
      <CategoryFilter
        categories={liveCategories}
        selected={selectedCategory}
        onSelect={selectCategory}
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
    </section>
  );
}
