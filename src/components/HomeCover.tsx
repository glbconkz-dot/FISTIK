'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BrandWordmark } from '@/components/Brand';
import { CuratedSection } from '@/components/CuratedSection';
import { Reveal } from '@/components/ui/Reveal';
import { resolveSectionProducts } from '@/lib/storefront-utils';
import type { Locale, Product, StorefrontSection } from '@/types';

interface HomeCoverProps {
  products: Product[];
  storefrontSections: StorefrontSection[];
  locale: Locale;
  fullPage?: boolean;
}

export function HomeCover({
  products,
  storefrontSections,
  locale,
  fullPage = false,
}: HomeCoverProps) {
  const t = useTranslations('home');

  const inStock = useMemo(
    () => products.filter((p) => Number(p.stock_quantity ?? 0) > 0),
    [products]
  );

  const autoTodaysFavorites = useMemo(() => inStock.slice(0, 4), [inStock]);

  const autoMostOrdered = useMemo(
    () =>
      [...inStock]
        .sort((a, b) => a.sort_order - b.sort_order)
        .slice(0, 4),
    [inStock]
  );

  const todaysFavorites = resolveSectionProducts(
    'todays_favorites',
    storefrontSections,
    products,
    autoTodaysFavorites
  );
  const mostOrdered = resolveSectionProducts(
    'most_ordered',
    storefrontSections,
    products,
    autoMostOrdered
  );

  return (
    <section
      className={`home-cover relative overflow-x-hidden bg-brand px-4 sm:px-6 ${
        fullPage
          ? 'rounded-none pb-6 pt-4 sm:pb-10 sm:pt-8'
          : '-mx-4 mb-10 rounded-b-[2rem] pb-8 pt-8 sm:-mx-0 sm:rounded-b-[2.5rem] sm:pb-10 sm:pt-10'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #fff 0%, transparent 45%), radial-gradient(circle at 80% 0%, #fff 0%, transparent 35%)',
        }}
      />

      <Reveal className="relative flex flex-col items-center text-center">
        <BrandWordmark className={fullPage ? 'h-14 sm:h-20 md:h-24' : 'h-16 sm:h-20 md:h-24'} />
        <p
          className={`mt-3 max-w-md font-display font-semibold leading-snug text-accent sm:mt-4 ${
            fullPage ? 'text-lg sm:text-2xl' : 'text-xl sm:text-2xl'
          }`}
        >
          {t('coverTagline')}
        </p>
      </Reveal>

      <div className={`relative ${fullPage ? 'mt-5 space-y-1 sm:mt-8 sm:space-y-2' : 'mt-8 space-y-2'}`}>
        <CuratedSection
          title={t('todaysFavorites')}
          subtitle={t('todaysFavoritesSub')}
          products={todaysFavorites}
          locale={locale}
          delay={0.05}
          compact={fullPage}
        />
        <CuratedSection
          title={t('mostOrdered')}
          subtitle={t('mostOrderedSub')}
          products={mostOrdered}
          locale={locale}
          delay={0.1}
          compact={fullPage}
        />
      </div>

      <Reveal delay={0.15} className={`relative flex justify-center ${fullPage ? 'mt-5 sm:mt-8' : 'mt-8'}`}>
        <Link href="/menu" className="home-cover-menu-btn group">
          <span>{t('openMenu')}</span>
          <ArrowRight
            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </Link>
      </Reveal>

      {fullPage ? (
        <Reveal delay={0.2} className="relative mt-6 flex justify-center pb-1 pt-4 sm:mt-8 sm:pt-6">
          <BrandWordmark className="h-10 opacity-95 sm:h-12" />
        </Reveal>
      ) : null}
    </section>
  );
}
