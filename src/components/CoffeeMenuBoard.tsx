'use client';

import { CoffeeProductCard } from '@/components/CoffeeProductCard';
import type { Locale, Product } from '@/types';

interface CoffeeMenuBoardProps {
  products: Product[];
  locale: Locale;
}

/** Referans gibi çok sütunlu kompakt menü ızgarası */
export function CoffeeMenuBoard({ products, locale }: CoffeeMenuBoardProps) {
  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <CoffeeProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
