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

function CatalogSectionInner(props: CatalogSectionProps) {
  return <CatalogClient {...props} />;
}

export function CatalogSection(props: CatalogSectionProps) {
  return (
    <Suspense fallback={null}>
      <CatalogSectionInner {...props} />
    </Suspense>
  );
}
