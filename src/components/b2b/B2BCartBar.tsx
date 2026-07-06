'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { formatPrice } from '@/lib/utils';
import { B2B_MIN_ORDER_TOTAL } from '@/lib/b2b/constants';
import { useIsClient } from '@/hooks/use-is-client';
import { useB2BCartStore } from '@/stores/b2b-cart';

function shouldHideCartBar(pathname: string): boolean {
  return (
    pathname.endsWith('/b2b/cart') ||
    pathname.endsWith('/b2b/checkout') ||
    pathname.endsWith('/b2b/orders')
  );
}

export function B2BCartBar() {
  const t = useTranslations('b2b.cart');
  const pathname = usePathname();
  const isClient = useIsClient();
  const totalItems = useB2BCartStore((s) => s.totalItems());
  const subtotal = useB2BCartStore((s) => s.subtotal());

  if (!isClient || totalItems === 0 || shouldHideCartBar(pathname)) return null;

  const belowMin = subtotal < B2B_MIN_ORDER_TOTAL;

  return (
    <div className="cart-bar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-baseline justify-between gap-3 sm:flex-col sm:items-start sm:gap-0">
            <p className="text-sm text-muted">{t('items', { count: totalItems })}</p>
            <p className="font-display text-xl font-bold tabular-nums">{formatPrice(subtotal)}</p>
            {belowMin ? (
              <p className="text-xs text-amber-700">
                {t('minOrder', { amount: formatPrice(B2B_MIN_ORDER_TOTAL) })}
              </p>
            ) : null}
          </div>
          <Link
            href={belowMin ? '/b2b/cart' : '/b2b/checkout'}
            className="btn-primary w-full shrink-0 sm:w-auto"
          >
            {belowMin ? t('viewCart') : t('checkout')}
          </Link>
        </div>
      </div>
    </div>
  );
}
