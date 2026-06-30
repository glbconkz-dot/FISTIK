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

  const displayQty = isClient && cartQty > 0 ? cartQty : pickQty;

  return (
    <div className="pb-8">
      <div className="relative aspect-square w-full overflow-hidden bg-cream md:aspect-[4/3] md:rounded-2xl">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-6xl text-accent/40">
            F
          </div>
        )}
        <div className="absolute right-4 top-4">
          <FavoriteButton productId={product.id} />
        </div>
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
                value={pickQty}
                max={remaining > 0 ? remaining : stock}
                onChange={(next) => setPickQty(Math.max(1, next))}
                label={t('quantity')}
              />
              <button
                type="button"
                onClick={handleTap}
                disabled={!isClient || atMax}
                className="btn-primary flex min-h-[48px] min-w-[80px] flex-1 items-center justify-center sm:max-w-xs disabled:opacity-50"
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
