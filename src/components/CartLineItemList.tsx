'use client';

import { useLocale } from 'next-intl';
import { CartLineItemRow } from '@/components/CartLineItemRow';
import { cn, formatPrice } from '@/lib/utils';
import type { CartItem, Locale } from '@/types';

interface CartLineItemListProps {
  items: CartItem[];
  subtotal: number;
  totalLabel: string;
  removeLabel: string;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  compact?: boolean;
  emptyMessage?: string;
  hideTotal?: boolean;
}

export function CartLineItemList({
  items,
  subtotal,
  totalLabel,
  removeLabel,
  removeItem,
  updateQuantity,
  compact = false,
  emptyMessage,
  hideTotal = false,
}: CartLineItemListProps) {
  const locale = useLocale() as Locale;

  if (items.length === 0) {
    return emptyMessage ? (
      <p className="py-4 text-center text-sm text-muted">{emptyMessage}</p>
    ) : null;
  }

  return (
    <div className={compact ? '' : 'space-y-2'}>
      {items.map((item) => (
        <CartLineItemRow
          key={item.productId}
          item={item}
          locale={locale}
          removeLabel={removeLabel}
          onRemove={() => removeItem(item.productId)}
          onUpdateQuantity={(quantity) => updateQuantity(item.productId, quantity)}
          maxQuantity={item.stockMax}
          compact={compact}
        />
      ))}
      {!hideTotal ? (
        <div
          className={cn(
            'flex items-center justify-between text-sm font-semibold',
            compact ? 'mt-2 border-t border-border pt-2.5' : 'luxury-card mt-2 px-2.5 py-3'
          )}
        >
          <span>{totalLabel}</span>
          <span className="text-base text-accent tabular-nums">{formatPrice(subtotal)}</span>
        </div>
      ) : null}
    </div>
  );
}
