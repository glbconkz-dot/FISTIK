'use client';

import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BrandWordmark } from '@/components/Brand';
import { CoverProductGrid } from '@/components/CoverProductGrid';
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

  const todaysFavorites = resolveSectionProducts(
    'todays_favorites',
    storefrontSections,
    products,
    autoTodaysFavorites
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

      <Reveal className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-2 text-center">
        <BrandWordmark className={fullPage ? 'h-12 sm:h-20 md:h-24' : 'h-16 sm:h-20 md:h-24'} />
        <p
          className={`mt-2 max-w-md font-display font-semibold leading-snug text-accent sm:mt-3 ${
            fullPage ? 'text-base sm:text-2xl' : 'text-xl sm:text-2xl'
          }`}
        >
          {t('coverTagline')}
        </p>
      </Reveal>

      <div
        className={`relative mx-auto w-full max-w-6xl ${
          fullPage ? 'mt-4 space-y-4 sm:mt-6 sm:space-y-5' : 'mt-8 space-y-2'
        }`}
      >
        {fullPage ? (
          <CoverProductGrid
            title={t('todaysFavorites')}
            subtitle={t('todaysFavoritesSub')}
            products={todaysFavorites}
            locale={locale}
            delay={0.05}
          />
        ) : (
          <CuratedSection
            title={t('todaysFavorites')}
            subtitle={t('todaysFavoritesSub')}
            products={todaysFavorites}
            locale={locale}
            delay={0.05}
          />
        )}
      </div>

      <Reveal
        delay={0.15}
        className={`relative mx-auto flex w-full max-w-6xl justify-center ${
          fullPage ? 'mt-4 sm:mt-6' : 'mt-8'
        }`}
      >
        <Link href="/menu" className="home-cover-menu-btn group">
          <span>{t('openMenu')}</span>
          <ArrowRight
            className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </Link>
      </Reveal>

      {fullPage ? (
        <Reveal delay={0.2} className="relative mx-auto mt-4 flex w-full max-w-6xl justify-center pb-2 pt-3 sm:mt-6 sm:pt-5">
          <BrandWordmark className="h-9 opacity-95 sm:h-12" />
        </Reveal>
      ) : null}
    </section>
  );
}
