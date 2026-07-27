'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { B2BProductCard } from '@/components/b2b/B2BProductCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { productMatchesCategoryFilter } from '@/lib/category-display';
import { scrollToCatalogProducts, CATALOG_PRODUCTS_ID } from '@/lib/catalog-scroll';
import { groupSemiFinishedProducts } from '@/lib/semi-finished-groups';
import type { Category, Locale, Product } from '@/types';

export function normalizeB2BCategoryParam(cat: string | null): string | null {
  if (!cat) return null;
  return cat === 'frozen-boreks' ? 'semi-finished' : cat;
}

interface B2BCatalogClientProps {
  products: Product[];
  categories: Category[];
  locale: Locale;
}

export function B2BCatalogClient({ products, categories, locale }: B2BCatalogClientProps) {
  const t = useTranslations('catalog');
  const tB2b = useTranslations('b2b.catalog');
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCategory = normalizeB2BCategoryParam(searchParams.get('cat'));
  const [overrideCategory, setOverrideCategory] = useState<string | null | undefined>(undefined);
  const selectedCategory = overrideCategory !== undefined ? overrideCategory : urlCategory;
  const skipInitialScroll = useRef(urlCategory == null);

  useEffect(() => {
    setOverrideCategory(undefined);
  }, [urlCategory]);

  useEffect(() => {
    const prev = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = prev;
    };
  }, []);

  useLayoutEffect(() => {
    if (skipInitialScroll.current) {
      skipInitialScroll.current = false;
      return;
    }
    scrollToCatalogProducts();
  }, [selectedCategory]);

  const selectCategory = useCallback(
    (slug: string | null) => {
      setOverrideCategory(slug);
      const opts = { scroll: false } as const;
      if (slug) {
        router.replace({ pathname: '/b2b/menu', query: { cat: slug } }, opts);
      } else {
        router.replace('/b2b/menu', opts);
      }
    },
    [router]
  );

  const filtered = selectedCategory
    ? products.filter((p) =>
        productMatchesCategoryFilter(p, selectedCategory, categories)
      )
    : products;

  const semiFinishedGroups =
    selectedCategory === 'semi-finished' ? groupSemiFinishedProducts(filtered) : null;

  const productGrid = (items: Product[]) => (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {items.map((product) => (
        <B2BProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );

  return (
    <section id={CATALOG_PRODUCTS_ID} className="mt-10 scroll-mt-24">
      <h2 className="section-title mb-5">{t('allProducts')}</h2>
      <p className="mb-4 text-sm text-muted">{tB2b('stockNote')}</p>
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={selectCategory}
        locale={locale}
        allLabel={t('allCategories')}
      />

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted">{t('empty')}</p>
      ) : semiFinishedGroups ? (
        <div className="mt-6 space-y-8">
          <p className="rounded-xl border border-border bg-cream/80 px-4 py-3 text-sm leading-relaxed text-muted">
            {t('semiFrozenNotice')}
          </p>
          {semiFinishedGroups.map((group) => (
            <div key={group.labelKey}>
              <h3 className="mb-3 font-display text-base font-semibold sm:text-lg">
                {t(group.labelKey)}
              </h3>
              {productGrid(group.products)}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6">{productGrid(filtered)}</div>
      )}
    </section>
  );
}
