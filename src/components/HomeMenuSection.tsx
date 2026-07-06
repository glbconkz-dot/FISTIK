'use client';

import { useTranslations } from 'next-intl';
import { CategoryShowcase } from '@/components/CategoryShowcase';
import type { Category, Locale, Product } from '@/types';

interface HomeMenuSectionProps {
  categories: Category[];
  products: Product[];
  locale: Locale;
  menuPath?: '/menu' | '/b2b/menu';
}

export function HomeMenuSection({
  categories,
  products,
  locale,
  menuPath = '/menu',
}: HomeMenuSectionProps) {
  const t = useTranslations('home');

  return (
    <section id="categories" className="scroll-mt-24">
      <CategoryShowcase
        categories={categories}
        products={products}
        locale={locale}
        title={t('categories')}
        menuPath={menuPath}
      />
    </section>
  );
}
