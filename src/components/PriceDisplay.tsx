'use client';

import { useTranslations } from 'next-intl';
import { getEffectivePrice, hasClearanceOffer } from '@/lib/b2c/clearance';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface PriceDisplayProps {
  product: Product;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: { price: 'text-sm', strike: 'text-xs', badge: 'text-[10px]', note: 'text-[10px]' },
  md: { price: 'text-sm', strike: 'text-xs', badge: 'text-xs', note: 'text-xs' },
  lg: { price: 'text-2xl', strike: 'text-base', badge: 'text-sm', note: 'text-sm' },
};

export function PriceDisplay({ product, className, size = 'md' }: PriceDisplayProps) {
  const t = useTranslations('catalog');
  const live = product.clearance_active && product.sale_price != null;
  const upcoming = product.clearance_scheduled && product.sale_price != null;
  const effective = getEffectivePrice(product);
  const base = Number(product.price);
  const sizes = sizeClasses[size];
  const windowLabel =
    product.clearance_start_time && product.clearance_end_time
      ? `${product.clearance_start_time}–${product.clearance_end_time}`
      : null;

  if (!hasClearanceOffer(product) || product.sale_price == null) {
    return (
      <p className={cn('font-semibold tabular-nums text-accent', sizes.price, className)}>
        {formatPrice(effective)}
      </p>
    );
  }

  if (live) {
    return (
      <div className={cn('space-y-0.5', className)}>
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className={cn('font-semibold tabular-nums text-red-700', sizes.price)}>
            {formatPrice(product.sale_price)}
          </span>
          <span className={cn('text-muted line-through tabular-nums', sizes.strike)}>
            {formatPrice(base)}
          </span>
          {product.sale_discount_percent ? (
            <span className={cn('font-semibold text-red-700', sizes.badge)}>
              -{product.sale_discount_percent}%
            </span>
          ) : null}
        </div>
        {windowLabel ? (
          <p className={cn('font-medium text-red-700/80', sizes.note)}>
            {t('clearanceLiveUntil', { end: product.clearance_end_time! })}
          </p>
        ) : null}
      </div>
    );
  }

  if (upcoming) {
    return (
      <div className={cn('space-y-0.5', className)}>
        <p className={cn('font-semibold tabular-nums text-accent', sizes.price)}>
          {formatPrice(base)}
        </p>
        <p className={cn('font-medium text-amber-800', sizes.note)}>
          {t('clearanceStartsAt', {
            start: product.clearance_start_time!,
            end: product.clearance_end_time!,
            percent: product.sale_discount_percent ?? 0,
            price: formatPrice(product.sale_price),
          })}
        </p>
      </div>
    );
  }

  return (
    <p className={cn('font-semibold tabular-nums text-accent', sizes.price, className)}>
      {formatPrice(effective)}
    </p>
  );
}
