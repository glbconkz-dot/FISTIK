'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { QuantitySelector } from '@/components/QuantitySelector';
import { useIsClient } from '@/hooks/use-is-client';
import { cn, formatPrice, getLocalizedDescription, getLocalizedName } from '@/lib/utils';
import { getProductImageClasses } from '@/lib/product-image';
import { getSemiFinishedPackLabelKey, showsSemiFinishedPackNote } from '@/lib/semi-finished-groups';
import { useB2BCartStore } from '@/stores/b2b-cart';
import type { Locale, Product } from '@/types';

interface B2BProductCardProps {
  product: Product;
  locale: Locale;
}

export function B2BProductCard({ product, locale }: B2BProductCardProps) {
  const t = useTranslations('b2b.catalog');
  const tCatalog = useTranslations('catalog');
  const isClient = useIsClient();
  const addItem = useB2BCartStore((s) => s.addItem);
  const updateQuantity = useB2BCartStore((s) => s.updateQuantity);
  const cartQty = useB2BCartStore(
    (s) => s.items.find((i) => i.productId === product.id)?.quantity ?? 0
  );

  const [pickQty, setPickQty] = useState(1);

  const inCart = isClient && cartQty > 0;

  const packLabelKey = getSemiFinishedPackLabelKey(product.slug);
  const packLabel = packLabelKey ? tCatalog(packLabelKey) : null;
  const name = getLocalizedName(product, locale);
  const description = getLocalizedDescription(product, locale);
  const showSubtitle =
    showsSemiFinishedPackNote(product.slug) ||
    product.category_id === 'boreks' ||
    product.category_id === 'frozen-boreks';
  const subtitle = packLabel ?? (showSubtitle && description ? description : null);

  const handleTap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isClient || pickQty <= 0) return;

    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name,
        price: Number(product.price),
        image: product.image_url,
      },
      pickQty
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
  const displayQty = inCart ? cartQty : pickQty;
  const imageClasses = getProductImageClasses(product.slug, product.image_url);

  return (
    <article
      className={cn(
        'luxury-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5',
        inCart && 'border border-brand-dark/40 bg-pistachio-soft ring-2 ring-brand-dark/50'
      )}
    >
      <div className="group block">
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
          {inCart ? (
            <div className="absolute left-2 top-2 z-10 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-accent shadow-sm tabular-nums">
              ×{cartQty}
            </div>
          ) : null}
        </div>
        <div className="p-4 pb-2">
          <h3 className="font-display text-lg font-semibold leading-tight">{name}</h3>
          {subtitle ? (
            <p className="mt-0.5 line-clamp-2 text-xs font-medium text-muted">{subtitle}</p>
          ) : null}
          <p className="mt-1 text-sm font-semibold text-accent">{formatPrice(Number(product.price))}</p>
          <p className="mt-0.5 text-xs text-muted">{t('madeToOrder')}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 px-4 pb-4">
        <QuantitySelector
          compact
          editable
          value={selectorValue}
          onChange={handleQuantityChange}
        />
        <button
          type="button"
          onClick={handleTap}
          disabled={!isClient}
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
      </div>
    </article>
  );
}
