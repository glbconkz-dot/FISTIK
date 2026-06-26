'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { QuantitySelector } from '@/components/QuantitySelector';
import { formatPrice, getLocalizedDescription, getLocalizedName } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import type { Locale, Product } from '@/types';

interface ProductCardProps {
  product: Product;
  locale: Locale;
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations('catalog');
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  const stock = Number(product.stock_quantity ?? 0);
  const outOfStock = stock <= 0;
  const name = getLocalizedName(product, locale);
  const description = getLocalizedDescription(product, locale);
  const showSubtitle =
    product.category_id === 'boreks' || product.category_id === 'frozen-boreks';

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
  };

  return (
    <article
      className={`luxury-card overflow-hidden transition-transform duration-200 ${
        outOfStock ? 'opacity-60' : 'hover:-translate-y-0.5'
      }`}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-square overflow-hidden bg-border/30">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-4xl text-accent">
              F
            </div>
          )}
          {outOfStock ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
              {t('soldOut')}
            </div>
          ) : null}
        </div>
        <div className="p-3 pb-2">
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

      <div className="flex items-center justify-end gap-2 px-3 pb-3">
        {outOfStock ? (
          <span className="text-sm font-medium text-muted">{t('soldOut')}</span>
        ) : (
          <>
            <QuantitySelector
              compact
              value={quantity}
              max={stock}
              onChange={(next) => setQuantity(Math.max(1, Math.min(stock, next)))}
            />
            <button
              type="button"
              onClick={handleAdd}
              className="flex min-h-[44px] items-center gap-1 rounded-full bg-foreground px-3 text-background touch-manipulation"
              aria-label={t('addToCart')}
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="text-sm font-semibold tabular-nums">×{quantity}</span>
            </button>
          </>
        )}
      </div>
    </article>
  );
}
