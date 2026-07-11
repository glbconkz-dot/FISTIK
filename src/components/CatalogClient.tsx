'use client';

import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ProductCard } from '@/components/ProductCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { productMatchesCategoryFilter } from '@/lib/category-display';
import { groupSemiFinishedProducts } from '@/lib/semi-finished-groups';
import { useLiveStockPatch } from '@/hooks/use-live-stock-patch';
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

  const liveProducts = useLiveStockPatch(products);

  // Product detail “back” lands on /menu?cat=… — jump to that category’s product grid.
  useEffect(() => {
    if (!selectedCategory) return;
    requestAnimationFrame(() => {
      document.getElementById('all-products')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }, [selectedCategory]);

  const selectCategory = useCallback(
    (slug: string | null) => {
      const opts = { scroll: false };
      if (slug) {
        router.replace({ pathname: '/menu', query: { cat: slug } }, opts);
      } else {
        router.replace('/menu', opts);
      }
    },
    [router]
  );

  const filtered = selectedCategory
    ? liveProducts.filter((p) =>
        productMatchesCategoryFilter(p, selectedCategory, categories)
      )
    : liveProducts;

  const semiFinishedGroups =
    selectedCategory === 'semi-finished' ? groupSemiFinishedProducts(filtered) : null;

  const productGrid = (items: Product[]) => (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );

  return (
    <section id="all-products" className="mt-10 scroll-mt-24">
      <h2 className="section-title mb-5">{t('allProducts')}</h2>
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
