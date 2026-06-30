'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/ui/Reveal';
import { FavoriteButton } from '@/components/FavoriteButton';
import { formatPrice, getLocalizedDescription, getLocalizedName } from '@/lib/utils';
import type { Locale, Product } from '@/types';

interface CuratedSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  locale: Locale;
  delay?: number;
}

export function CuratedSection({
  title,
  subtitle,
  products,
  locale,
  delay = 0,
}: CuratedSectionProps) {
  const t = useTranslations('catalog');

  if (products.length === 0) return null;

  return (
    <Reveal delay={delay} className="mb-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
      </div>

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide sm:mx-0 sm:px-0">
        {products.map((product) => {
          const name = getLocalizedName(product, locale);
          const description = getLocalizedDescription(product, locale);
          const stock = Number(product.stock_quantity ?? 0);
          const outOfStock = stock <= 0;

          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group w-[72vw] max-w-[280px] shrink-0 sm:w-[240px]"
            >
              <article className="luxury-card overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
                <div className="relative aspect-[4/5] overflow-hidden bg-cream">
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
                  ) : null}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-xl font-semibold leading-tight">{name}</h3>
                  {description ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                      {description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-base font-semibold text-accent">
                    {formatPrice(Number(product.price))}
                  </p>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </Reveal>
  );
}
