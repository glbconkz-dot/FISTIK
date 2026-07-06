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
import { useCartStore } from '@/stores/cart';
import type { Product } from '@/types';
import type { Locale } from '@/types';

interface ProductDetailClientProps {
  product: Product;
  categoryName: string;
  locale: Locale;
}

export function ProductDetailClient({ product, categoryName, locale }: ProductDetailClientProps) {
  const t = useTranslations('product');
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

  const name = getLocalizedName(product, locale);
  const description = getLocalizedDescription(product, locale);

  const handleTap = () => {
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
    <div className={cn('pb-8', inCart && 'rounded-2xl bg-pistachio-soft/60 p-4 ring-2 ring-brand-dark/40')}>
      <div className={`relative aspect-square w-full overflow-hidden md:aspect-[4/3] md:rounded-2xl ${imageClasses.container}`}>
        {product.image_url ? (
          <div className={imageClasses.frame}>
            <Image
              src={product.image_url}
              alt={name}
              fill
              className={imageClasses.image}
              priority
              sizes="100vw"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center font-display text-6xl text-accent/40">
            F
          </div>
        )}
        <div className="absolute right-4 top-4">
          <FavoriteButton productId={product.id} />
        </div>
        {inCart ? (
          <div className="absolute left-4 top-4 z-10 rounded-full bg-brand px-3 py-1.5 text-sm font-bold text-accent shadow-sm tabular-nums">
            ×{cartQty}
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-sm text-accent">{categoryName}</p>
          <h1 className="font-display text-3xl font-bold">{name}</h1>
          <p className="mt-2 text-2xl font-semibold text-accent">
            {formatPrice(Number(product.price))}
          </p>
          {!outOfStock ? (
            <p className="mt-1 text-sm text-muted">{t('stockLeft', { count: stock })}</p>
          ) : (
            <p className="mt-1 text-sm font-medium text-red-600">{t('soldOut')}</p>
          )}
        </div>

        {description && <p className="leading-relaxed text-muted">{description}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {outOfStock ? (
            <p className="text-muted">{t('soldOut')}</p>
          ) : (
            <>
              <QuantitySelector
                editable
                value={selectorValue}
                max={selectorMax}
                onChange={handleQuantityChange}
                label={t('quantity')}
              />
              <button
                type="button"
                onClick={handleTap}
                disabled={!isClient || atMax}
                className={cn(
                  'btn-primary flex min-h-[48px] min-w-[80px] flex-1 items-center justify-center sm:max-w-xs disabled:opacity-50',
                  inCart && 'bg-brand text-accent ring-1 ring-brand-dark/40 hover:bg-brand/90'
                )}
              >
                <span className="font-semibold tabular-nums">×{displayQty}</span>
              </button>
            </>
          )}
        </div>

        <Link href="/cart" className="btn-outline block text-center">
          {t('viewCart')}
        </Link>
      </div>
    </div>
  );
}
