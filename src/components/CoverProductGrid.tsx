'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/ui/Reveal';
import { PriceDisplay } from '@/components/PriceDisplay';
import { getLocalizedName } from '@/lib/utils';
import type { Locale, Product } from '@/types';

interface CoverProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  locale: Locale;
  delay?: number;
}

export function CoverProductGrid({
  title,
  subtitle,
  products,
  locale,
  delay = 0,
}: CoverProductGridProps) {
  const t = useTranslations('catalog');
  const items = products.slice(0, 4);

  if (items.length === 0) return null;

  return (
    <Reveal delay={delay} className="cover-showcase">
      <header className="cover-showcase-header">
        <h2 className="font-display text-base font-semibold leading-tight text-accent sm:text-xl">
          {title}
        </h2>
        {subtitle ? <p className="mt-0.5 text-[11px] leading-snug text-accent/75 sm:text-xs">{subtitle}</p> : null}
      </header>

      <div className="cover-product-grid">
        {items.map((product, i) => {
          const name = getLocalizedName(product, locale);
          const stock = Number(product.stock_quantity ?? 0);
          const outOfStock = stock <= 0;

          return (
            <Link key={product.id} href={`/product/${product.slug}`} className="cover-product-card group">
              <div className="cover-product-photo">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={name}
                    fill
                    priority={i < 2}
                    className="object-cover object-bottom transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 45vw, 180px"
                  />
                ) : (
                  <div className="flex h-full items-end justify-center pb-3 font-display text-3xl text-accent/35">
                    F
                  </div>
                )}
                {product.clearance_active && product.sale_discount_percent ? (
                  <span className="cover-product-badge bg-red-600 text-white">
                    -{product.sale_discount_percent}%
                  </span>
                ) : null}
                {outOfStock ? (
                  <span className="cover-product-badge">{t('soldOut')}</span>
                ) : null}
              </div>
              <div className="cover-product-meta">
                <p className="line-clamp-2 font-medium leading-snug text-accent">{name}</p>
                <div className="mt-0.5">
                  <PriceDisplay product={product} size="sm" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Reveal>
  );
}
