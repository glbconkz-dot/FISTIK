'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn, formatPrice, getLocalizedNameBySlug } from '@/lib/utils';
import type { CartItem, Locale } from '@/types';

interface CartLineItemRowProps {
  item: CartItem;
  locale: Locale;
  removeLabel: string;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
  maxQuantity?: number;
  compact?: boolean;
}

function CompactQtyControl({
  quantity,
  atMax,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  atMax: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center rounded-full border border-border bg-surface">
      <button
        type="button"
        onClick={onDecrease}
        className="flex h-8 w-7 items-center justify-center text-muted touch-manipulation hover:text-foreground"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="min-w-[1.25rem] text-center text-sm font-medium tabular-nums">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={atMax}
        className="flex h-8 w-7 items-center justify-center text-muted touch-manipulation hover:text-foreground disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

export function CartLineItemRow({
  item,
  locale,
  removeLabel,
  onRemove,
  onUpdateQuantity,
  maxQuantity,
  compact = false,
}: CartLineItemRowProps) {
  const name = getLocalizedNameBySlug(item.slug, locale, item.name);
  const atMax = maxQuantity != null ? item.quantity >= maxQuantity : false;
  const lineTotal = formatPrice(item.price * item.quantity);

  return (
    <div
      className={cn(
        'flex items-center gap-2.5',
        compact ? 'border-b border-border/70 py-2.5 last:border-0' : 'luxury-card gap-3 p-2.5'
      )}
    >
      {!compact ? (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-border/30">
          {item.image ? (
            <Image src={item.image} alt={name} fill className="object-cover" sizes="48px" />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-lg text-accent/60">
              F
            </div>
          )}
        </div>
      ) : null}

      <p
        className={cn(
          'min-w-0 flex-1 line-clamp-2 leading-snug text-foreground',
          compact ? 'text-[15px] font-medium' : 'text-sm font-medium sm:text-[15px]'
        )}
      >
        {name}
      </p>

      <CompactQtyControl
        quantity={item.quantity}
        atMax={atMax}
        onDecrease={() => onUpdateQuantity(item.quantity - 1)}
        onIncrease={() => onUpdateQuantity(item.quantity + 1)}
      />

      <span className="shrink-0 whitespace-nowrap text-right text-sm font-semibold text-accent tabular-nums">
        {lineTotal}
      </span>

      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted touch-manipulation hover:bg-red-50 hover:text-red-600"
        aria-label={removeLabel}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
