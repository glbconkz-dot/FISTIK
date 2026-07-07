'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { FavoriteButton } from '@/components/FavoriteButton';
import { QuantitySelector } from '@/components/QuantitySelector';
import { useIsClient } from '@/hooks/use-is-client';
import { cn, formatPrice, getLocalizedDescription, getLocalizedName } from '@/lib/utils';
import { getProductImageClasses } from '@/lib/product-image';
import { getSemiFinishedPackLabel, showsSemiFinishedPackNote } from '@/lib/semi-finished-groups';
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
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartQty = useCartStore(
    (s) => s.items.find((i) => i.productId === product.id)?.quantity ?? 0
  );

  const stock = Number(product.stock_quantity ?? 0);
  const outOfStock = stock <= 0;
  const [pickQty, setPickQty] = useState(1);

  const inCart = isClient && cartQty > 0;
  const remaining = Math.max(0, stock - (isClient ? cartQty : 0));
  const atMax = remaining <= 0;
  const addPerTap = Math.min(pickQty, remaining || pickQty);

  const packLabel = getSemiFinishedPackLabel(product.slug, (key) =>
    t(key as 'packLabel6' | 'packLabel16' | 'packLabel4' | 'packLabelSarma')
  );
  const name = getLocalizedName(product, locale);
  const description = getLocalizedDescription(product, locale);
  const showLongNote =
    showsSemiFinishedPackNote(product.slug) ||
    product.category_id === 'boreks' ||
    product.category_id === 'frozen-boreks';
  const longNote = !packLabel && showLongNote && description ? description : null;

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

  const handleQuantityChange = (next: number) => {
    if (inCart) {
      updateQuantity(product.id, next);
      return;
    }
    setPickQty(Math.max(1, next));
  };

  const selectorValue = inCart ? cartQty : pickQty;
  const selectorMax = inCart ? stock : remaining > 0 ? remaining : stock;
  const displayQty = inCart ? cartQty : pickQty;
  const imageClasses = getProductImageClasses(product.slug, product.image_url);

  return (
    <article
      className={cn(
        'luxury-card overflow-hidden transition-all duration-200',
        outOfStock ? 'opacity-60' : 'hover:-translate-y-0.5',
        inCart && 'border border-brand-dark/40 bg-pistachio-soft ring-2 ring-brand-dark/50'
      )}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div className={`relative aspect-[4/5] overflow-hidden ${imageClasses.container}`}>
          {product.image_url ? (
            <div className={imageClasses.frame}>
              <Image
                src={product.image_url}
                alt={name}
                fill
                className={imageClasses.imageCard}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center font-display text-4xl text-accent/40">
              F
            </div>
          )}
          <div className="absolute right-2 top-2">
            <FavoriteButton productId={product.id} size="sm" />
          </div>
          {inCart ? (
            <div className="absolute left-2 top-2 z-10 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-accent shadow-sm tabular-nums">
              ×{cartQty}
            </div>
          ) : null}
          {outOfStock ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
              {t('soldOut')}
            </div>
          ) : null}
        </div>
        <div className="p-4 pb-2">
          <h3 className="font-display text-lg font-semibold leading-tight">{name}</h3>
          {longNote ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">{longNote}</p>
          ) : null}
          <div className="mt-1.5">
            <p className="text-sm font-semibold text-accent tabular-nums">
              {formatPrice(Number(product.price))}
            </p>
            {packLabel ? (
              <p className="mt-0.5 text-xs font-semibold text-foreground/80">{packLabel}</p>
            ) : null}
          </div>
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
              value={selectorValue}
              max={selectorMax}
              onChange={handleQuantityChange}
            />
            <button
              type="button"
              onClick={handleTap}
              disabled={!isClient || atMax}
              className={cn(
                'flex min-h-[44px] min-w-[52px] items-center justify-center rounded-full px-4 touch-manipulation disabled:opacity-50',
                inCart
                  ? 'bg-brand text-accent ring-1 ring-brand-dark/40'
                  : 'bg-foreground text-background'
              )}
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
