'use client';

import { Suspense } from 'react';
import { CatalogClient } from '@/components/CatalogClient';
import type { Category, Product } from '@/types';
import type { Locale } from '@/types';

interface CatalogSectionProps {
  products: Product[];
  categories: Category[];
  locale: Locale;
}

function CatalogSectionInner({ products, categories, locale }: CatalogSectionProps) {
  return <CatalogClient products={products} categories={categories} locale={locale} />;
}

export function CatalogSection(props: CatalogSectionProps) {
  return (
    <Suspense fallback={null}>
      <CatalogSectionInner {...props} />
    </Suspense>
  );
}
