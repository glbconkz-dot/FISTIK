'use client';

import { Suspense } from 'react';
import { B2BCatalogClient } from '@/components/b2b/B2BCatalogClient';
import type { Category, Locale, Product } from '@/types';

interface B2BCatalogSectionProps {
  products: Product[];
  categories: Category[];
  locale: Locale;
}

function B2BCatalogSectionInner(props: B2BCatalogSectionProps) {
  return <B2BCatalogClient {...props} />;
}

export function B2BCatalogSection(props: B2BCatalogSectionProps) {
  return (
    <Suspense fallback={null}>
      <B2BCatalogSectionInner {...props} />
    </Suspense>
  );
}
