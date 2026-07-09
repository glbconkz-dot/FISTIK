'use client';

import { useTranslations } from 'next-intl';
import { B2COrderRulesNotice } from '@/components/B2COrderRulesNotice';
import { CartLineItemList } from '@/components/CartLineItemList';
import { Link } from '@/i18n/routing';
import { isB2COrderAllowed } from '@/lib/b2c/pricing';
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
        <Link href="/menu" className="btn-primary mt-6 inline-flex">
          {t('emptyCta')}
        </Link>
      </div>
    );
  }

  const belowMin = !isB2COrderAllowed(subtotal);

  return (
    <div className="space-y-4">
      <B2COrderRulesNotice subtotal={subtotal} />

      <CartLineItemList
        items={items}
        subtotal={subtotal}
        totalLabel={t('subtotal')}
        removeLabel={t('remove')}
        removeItem={removeItem}
        updateQuantity={updateQuantity}
      />

      {belowMin ? (
        <button type="button" className="btn-primary w-full opacity-50" disabled>
          {t('continue')}
        </button>
      ) : (
        <Link href="/checkout" className="btn-primary w-full">
          {t('continue')}
        </Link>
      )}
    </div>
  );
}
