'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { FavoriteButton } from '@/components/FavoriteButton';
import { QuantitySelector } from '@/components/QuantitySelector';
import { useIsClient } from '@/hooks/use-is-client';
import { formatPrice, getLocalizedDescription, getLocalizedName } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import type { Locale, Product } from '@/types';

interface ProductCardProps {
  product: Product;
  locale: Locale;
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations('catalog');
  const isClient = useIsClient();
  const addItem = useCartStore((s) => s.addItem);
  const cartQty = useCartStore(
    (s) => s.items.find((i) => i.productId === product.id)?.quantity ?? 0
  );

  const stock = Number(product.stock_quantity ?? 0);
  const outOfStock = stock <= 0;
  const [pickQty, setPickQty] = useState(1);

  const remaining = Math.max(0, stock - (isClient ? cartQty : 0));
  const atMax = remaining <= 0;
  const addPerTap = Math.min(pickQty, remaining || pickQty);

  const name = getLocalizedName(product, locale);
  const description = getLocalizedDescription(product, locale);
  const showSubtitle =
    product.category_id === 'boreks' || product.category_id === 'frozen-boreks';

  const handleTap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isClient || outOfStock || atMax || addPerTap <= 0) return;

    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name,
        price: Number(product.price),
        image: product.image_url,
        stockMax: stock,
      },
      addPerTap
    );
  };

  const displayQty = isClient && cartQty > 0 ? cartQty : pickQty;

  return (
    <article
      className={`luxury-card overflow-hidden transition-transform duration-200 ${
        outOfStock ? 'opacity-60' : 'hover:-translate-y-0.5'
      }`}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-cream">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-4xl text-accent/40">
              F
            </div>
          )}
          <div className="absolute right-2 top-2">
            <FavoriteButton productId={product.id} size="sm" />
          </div>
          {outOfStock ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
              {t('soldOut')}
            </div>
          ) : null}
        </div>
        <div className="p-4 pb-2">
          <h3 className="font-display text-lg font-semibold leading-tight">{name}</h3>
          {showSubtitle && description ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">{description}</p>
          ) : null}
          <p className="mt-1 text-sm font-semibold text-accent">{formatPrice(Number(product.price))}</p>
          {!outOfStock ? (
            <p className="mt-0.5 text-xs text-muted">{t('stockLeft', { count: stock })}</p>
          ) : null}
        </div>
      </Link>

      <div
        className="flex items-center justify-end gap-2 px-4 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        {outOfStock ? (
          <span className="text-sm font-medium text-muted">{t('soldOut')}</span>
        ) : (
          <>
            <QuantitySelector
              compact
              editable
              value={pickQty}
              max={remaining > 0 ? remaining : stock}
              onChange={(next) => setPickQty(Math.max(1, next))}
            />
            <button
              type="button"
              onClick={handleTap}
              disabled={!isClient || atMax}
              className="flex min-h-[44px] min-w-[52px] items-center justify-center rounded-full bg-foreground px-4 text-background touch-manipulation disabled:opacity-50"
              aria-label={t('addToCart')}
            >
              <span className="text-sm font-semibold tabular-nums">×{displayQty}</span>
            </button>
          </>
        )}
      </div>
    </article>
  );
}
