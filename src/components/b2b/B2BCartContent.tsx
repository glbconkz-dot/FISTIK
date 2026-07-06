'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { CartLineItemList } from '@/components/CartLineItemList';
import { formatPrice } from '@/lib/utils';
import { B2B_MIN_ORDER_TOTAL } from '@/lib/b2b/constants';
import { useB2BCartStore } from '@/stores/b2b-cart';

export function B2BCartContent() {
  const t = useTranslations('b2b.cart');
  const items = useB2BCartStore((s) => s.items);
  const updateQuantity = useB2BCartStore((s) => s.updateQuantity);
  const removeItem = useB2BCartStore((s) => s.removeItem);
  const subtotal = useB2BCartStore((s) => s.subtotal());

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted">{t('empty')}</p>
        <Link href="/b2b/menu" className="btn-primary mt-6 inline-flex">
          {t('emptyCta')}
        </Link>
      </div>
    );
  }

  const belowMin = subtotal < B2B_MIN_ORDER_TOTAL;

  return (
    <div className="space-y-4">
      <CartLineItemList
        items={items}
        subtotal={subtotal}
        totalLabel={t('subtotal')}
        removeLabel={t('remove')}
        removeItem={removeItem}
        updateQuantity={updateQuantity}
      />

      {belowMin ? (
        <p className="text-sm text-amber-700">
          {t('minOrder', { amount: formatPrice(B2B_MIN_ORDER_TOTAL) })}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href="/b2b/menu" className="btn-outline flex-1 text-center">
          {t('backToMenu')}
        </Link>
        {belowMin ? (
          <button type="button" className="btn-primary flex-1 opacity-50" disabled>
            {t('checkout')}
          </button>
        ) : (
          <Link href="/b2b/checkout" className="btn-primary flex-1 text-center">
            {t('checkout')}
          </Link>
        )}
      </div>
    </div>
  );
}
