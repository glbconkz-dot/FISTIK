'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/ui/Reveal';
import { FavoriteButton } from '@/components/FavoriteButton';
import { PriceDisplay } from '@/components/PriceDisplay';
import { getLocalizedDescription, getLocalizedName } from '@/lib/utils';
import type { Locale, Product } from '@/types';

interface CuratedSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  locale: Locale;
  delay?: number;
  compact?: boolean;
}

export function CuratedSection({
  title,
  subtitle,
  products,
  locale,
  delay = 0,
  compact = false,
}: CuratedSectionProps) {
  const t = useTranslations('catalog');

  if (products.length === 0) return null;

  return (
    <Reveal delay={delay} className={compact ? 'mb-5 sm:mb-14' : 'mb-14'}>
      <div className={`flex items-end justify-between gap-4 ${compact ? 'mb-3 sm:mb-5' : 'mb-5'}`}>
        <div>
          <h2 className={compact ? 'font-display text-xl font-semibold leading-tight sm:text-3xl' : 'section-title'}>
            {title}
          </h2>
          {subtitle ? (
            <p className={`mt-1 text-muted ${compact ? 'text-xs sm:text-sm' : 'text-sm'}`}>{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:gap-4 sm:px-0 sm:pb-2">
        {products.map((product) => {
          const name = getLocalizedName(product, locale);
          const description = getLocalizedDescription(product, locale);
          const stock = Number(product.stock_quantity ?? 0);
          const outOfStock = stock <= 0;

          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className={`group shrink-0 ${
                compact ? 'w-[58vw] max-w-[210px] sm:w-[240px] sm:max-w-[280px]' : 'w-[72vw] max-w-[280px] sm:w-[240px]'
              }`}
            >
              <article className="luxury-card overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
                <div className={`relative overflow-hidden bg-cream ${compact ? 'aspect-[3/4]' : 'aspect-[4/5]'}`}>
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="280px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-display text-5xl text-accent/40">
                      F
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <FavoriteButton productId={product.id} size="sm" />
                  </div>
                  {outOfStock ? (
                    <div className="absolute inset-x-0 bottom-0 bg-foreground/75 py-2 text-center text-xs font-medium text-surface">
                      {t('soldOut')}
                    </div>
                  ) : product.clearance_active && product.sale_discount_percent ? (
                    <div className="absolute inset-x-0 bottom-0 bg-red-600/90 py-1.5 text-center text-xs font-semibold text-white">
                      -{product.sale_discount_percent}%
                    </div>
                  ) : product.clearance_scheduled && product.sale_discount_percent ? (
                    <div className="absolute inset-x-0 bottom-0 bg-amber-700/90 py-1.5 text-center text-[11px] font-semibold text-white">
                      {product.clearance_start_time} · -{product.sale_discount_percent}%
                    </div>
                  ) : null}
                </div>
                <div className={compact ? 'p-3 sm:p-4' : 'p-4'}>
                  <h3
                    className={`font-display font-semibold leading-tight ${
                      compact ? 'text-lg sm:text-xl' : 'text-xl'
                    }`}
                  >
                    {name}
                  </h3>
                  {description ? (
                    <p
                      className={`mt-1 line-clamp-2 leading-relaxed text-muted ${
                        compact ? 'text-[11px] sm:text-xs' : 'text-xs'
                      }`}
                    >
                      {description}
                    </p>
                  ) : null}
                  <div className="mt-2">
                    <PriceDisplay product={product} />
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </Reveal>
  );
}
