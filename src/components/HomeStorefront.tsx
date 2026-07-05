'use client';

import { HomeCover } from '@/components/HomeCover';
import type { Locale, Product, StorefrontSection } from '@/types';

interface HomeStorefrontProps {
  products: Product[];
  storefrontSections: StorefrontSection[];
  locale: Locale;
  fullPage?: boolean;
}

export function HomeStorefront({
  products,
  storefrontSections,
  locale,
  fullPage = false,
}: HomeStorefrontProps) {
  return (
    <HomeCover
      products={products}
      storefrontSections={storefrontSections}
      locale={locale}
      fullPage={fullPage}
    />
  );
}
