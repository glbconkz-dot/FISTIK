'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { QuantitySelector } from '@/components/QuantitySelector';
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
  const addItem = useCartStore((s) => s.addItem);
  const stock = Number(product.stock_quantity ?? 0);
  const outOfStock = stock <= 0;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const name = getLocalizedName(product, locale);
  const description = getLocalizedDescription(product, locale);

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name,
        price: Number(product.price),
        image: product.image_url,
      },
      Math.min(quantity, stock)
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="pb-8">
      <div className="relative aspect-square w-full overflow-hidden bg-border/30 md:aspect-[4/3] md:rounded-2xl">
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
          <div className="flex h-full items-center justify-center font-display text-6xl text-accent">
            F
          </div>
        )}
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
                value={quantity}
                max={stock}
                onChange={(next) => setQuantity(Math.max(1, Math.min(stock, next)))}
                label={t('quantity')}
              />
              <button type="button" onClick={handleAdd} className="btn-primary flex-1 sm:max-w-xs">
                {added ? `${t('addToCart')} ✓` : `${t('addToCart')} ×${quantity}`}
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
