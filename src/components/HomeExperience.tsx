'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CategoryShowcase } from '@/components/CategoryShowcase';
import { CuratedSection } from '@/components/CuratedSection';
import type { Category, Locale, Product } from '@/types';

interface HomeExperienceProps {
  products: Product[];
  categories: Category[];
  locale: Locale;
}

export function HomeExperience({ products, categories, locale }: HomeExperienceProps) {
  const t = useTranslations('home');

  const inStock = useMemo(
    () => products.filter((p) => Number(p.stock_quantity ?? 0) > 0),
    [products]
  );

  const todaysFavorites = useMemo(() => inStock.slice(0, 4), [inStock]);

  const newCollection = useMemo(
    () =>
      [...products]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4),
    [products]
  );

  const mostOrdered = useMemo(
    () =>
      [...inStock]
        .sort((a, b) => a.sort_order - b.sort_order)
        .slice(0, 4),
    [inStock]
  );

  const chefsSelection = useMemo(() => {
    const picked: Product[] = [];
    const seen = new Set<string>();
    for (const cat of categories) {
      if (!cat.is_active) continue;
      const item = inStock.find((p) => p.category_id === cat.id);
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        picked.push(item);
      }
      if (picked.length >= 4) break;
    }
    return picked;
  }, [categories, inStock]);

  return (
    <div className="mb-12">
      <CuratedSection
        title={t('todaysFavorites')}
        subtitle={t('todaysFavoritesSub')}
        products={todaysFavorites}
        locale={locale}
        delay={0.05}
      />
      <CategoryShowcase
        categories={categories}
        products={products}
        locale={locale}
        title={t('categories')}
      />
      <CuratedSection
        title={t('newCollection')}
        subtitle={t('newCollectionSub')}
        products={newCollection}
        locale={locale}
        delay={0.1}
      />
      <CuratedSection
        title={t('mostOrdered')}
        subtitle={t('mostOrderedSub')}
        products={mostOrdered}
        locale={locale}
        delay={0.15}
      />
      <CuratedSection
        title={t('chefsSelection')}
        subtitle={t('chefsSelectionSub')}
        products={chefsSelection}
        locale={locale}
        delay={0.2}
      />
    </div>
  );
}
