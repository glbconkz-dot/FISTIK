'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { B2COrderRulesNotice } from '@/components/B2COrderRulesNotice';
import { formatPrice } from '@/lib/utils';
import { isB2COrderAllowed } from '@/lib/b2c/pricing';
import { useIsClient } from '@/hooks/use-is-client';
import { useCartStore } from '@/stores/cart';

/** Sepet/checkout sayfalarında alt bar butonları kapatmasın diye gizle */
function shouldHideCartBar(pathname: string): boolean {
  return pathname.endsWith('/cart') || pathname.endsWith('/checkout');
}

export function CartBar() {
  const t = useTranslations('cart');
  const pathname = usePathname();
  const isClient = useIsClient();
  const totalItems = useCartStore((s) => s.totalItems());
  const subtotal = useCartStore((s) => s.subtotal());

  if (!isClient || totalItems === 0 || shouldHideCartBar(pathname)) return null;

  const belowMin = !isB2COrderAllowed(subtotal);

  return (
    <div className="cart-bar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {belowMin ? (
          <div className="mb-2">
            <B2COrderRulesNotice subtotal={subtotal} compact />
          </div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-baseline justify-between gap-3 sm:flex-col sm:items-start sm:gap-0">
            <p className="text-sm text-muted">{t('items', { count: totalItems })}</p>
            <p className="font-display text-xl font-bold tabular-nums">{formatPrice(subtotal)}</p>
          </div>
          {belowMin ? (
            <button type="button" className="btn-primary w-full shrink-0 opacity-50 sm:w-auto" disabled>
              {t('continue')}
            </button>
          ) : (
            <Link href="/cart" className="btn-primary w-full shrink-0 sm:w-auto">
              {t('continue')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
