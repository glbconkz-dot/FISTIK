'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/ui/Reveal';
import { useFavoritesStore } from '@/stores/favorites';
import type { Category, Locale, Product } from '@/types';

interface FavoritesClientProps {
  products: Product[];
  categories: Category[];
  locale: Locale;
}

export function FavoritesClient({ products, locale }: FavoritesClientProps) {
  const t = useTranslations('favorites');
  const ids = useFavoritesStore((s) => s.ids);

  const favorites = useMemo(
    () => products.filter((p) => ids.includes(p.id)),
    [products, ids]
  );

  if (favorites.length === 0) {
    return (
      <Reveal className="flex flex-col items-center py-16 text-center">
        <p className="font-display text-2xl font-semibold">{t('empty')}</p>
        <p className="mt-2 max-w-sm text-sm text-muted">{t('emptySub')}</p>
        <Link href="/" className="btn-primary mt-8">
          {t('browse')}
        </Link>
      </Reveal>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {favorites.map((product, i) => (
        <Reveal key={product.id} delay={i * 0.05}>
          <ProductCard product={product} locale={locale} />
        </Reveal>
      ))}
    </div>
  );
}
