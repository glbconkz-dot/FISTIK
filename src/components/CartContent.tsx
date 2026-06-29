'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';

export function CartContent() {
  const t = useTranslations('cart');
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted">{t('empty')}</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          {t('emptyCta')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.productId} className="luxury-card flex gap-3 p-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-border/30">
            {item.image ? (
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-2xl text-accent">
                F
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-semibold leading-tight">{item.name}</h3>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center text-muted hover:text-red-600 touch-manipulation"
                  aria-label={t('remove')}
                >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center rounded-full border border-border">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center touch-manipulation"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[1.5rem] text-center text-sm font-semibold">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={
                    item.stockMax != null ? item.quantity >= item.stockMax : false
                  }
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center touch-manipulation disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="font-semibold text-accent">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          </div>
        </div>
      ))}

      <div className="luxury-card flex items-center justify-between p-4">
        <span className="font-medium">{t('subtotal')}</span>
        <span className="font-display text-xl font-bold text-accent">{formatPrice(subtotal)}</span>
      </div>

      <Link href="/checkout" className="btn-primary w-full">
        {t('continue')}
      </Link>
    </div>
  );
}
