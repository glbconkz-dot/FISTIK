'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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

  const filtered = selectedCategory
    ? products.filter((p) => {
        const cat = categories.find((c) => c.id === p.category_id);
        return cat?.slug === selectedCategory;
      })
    : products;

  return (
    <>
      <CategoryFilter
        categories={categories}
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
