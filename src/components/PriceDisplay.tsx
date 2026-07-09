import { getEffectivePrice } from '@/lib/b2c/clearance';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface PriceDisplayProps {
  product: Product;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: { price: 'text-sm', strike: 'text-xs', badge: 'text-[10px]' },
  md: { price: 'text-sm', strike: 'text-xs', badge: 'text-xs' },
  lg: { price: 'text-2xl', strike: 'text-base', badge: 'text-sm' },
};

export function PriceDisplay({ product, className, size = 'md' }: PriceDisplayProps) {
  const onSale = product.clearance_active && product.sale_price != null;
  const effective = getEffectivePrice(product);
  const base = Number(product.price);
  const sizes = sizeClasses[size];

  if (!onSale) {
    return (
      <p className={cn('font-semibold tabular-nums text-accent', sizes.price, className)}>
        {formatPrice(effective)}
      </p>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5', className)}>
      <span className={cn('font-semibold tabular-nums text-red-700', sizes.price)}>
        {formatPrice(effective)}
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
  );
}
