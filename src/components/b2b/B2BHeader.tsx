'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BrandLink } from '@/components/Brand';
import { LogOut, ShoppingBag, ClipboardList } from 'lucide-react';
import { signOutB2B } from '@/app/actions/b2b-auth';
import { useIsClient } from '@/hooks/use-is-client';
import { useB2BCartStore } from '@/stores/b2b-cart';
import type { B2BCustomerWithBranches } from '@/types/b2b';
import type { Locale } from '@/types';

interface B2BHeaderProps {
  customer?: B2BCustomerWithBranches | null;
  locale: Locale;
}

export function B2BHeader({ customer, locale }: B2BHeaderProps) {
  const t = useTranslations('b2b');
  const isClient = useIsClient();
  const cartCount = useB2BCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-40 border-b border-brand-dark/35 bg-brand">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <BrandLink wordmark />
          <p className="truncate text-xs text-cream/85">{t('portalTitle')}</p>
        </div>

        {customer ? (
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <span className="hidden max-w-[10rem] truncate text-sm text-cream/90 lg:inline">
              {customer.company_name}
            </span>
            <Link
              href="/b2b/menu"
              className="rounded-lg px-2 py-2 text-sm font-medium text-cream/90 hover:bg-cream/15 hover:text-cream sm:px-3"
            >
              {t('nav.menu')}
            </Link>
            <Link
              href="/b2b/orders"
              className="hidden rounded-lg px-2 py-2 text-sm font-medium text-cream/90 hover:bg-cream/15 hover:text-cream sm:inline sm:px-3"
            >
              {t('nav.orders')}
            </Link>
            <Link
              href="/b2b/orders"
              className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-cream/90 hover:bg-cream/15 hover:text-cream sm:hidden"
              aria-label={t('nav.orders')}
            >
              <ClipboardList className="h-5 w-5" />
            </Link>
            <Link
              href="/b2b/cart"
              className="relative flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-cream/90 hover:bg-cream/15 hover:text-cream"
              aria-label={t('nav.cart')}
            >
              <ShoppingBag className="h-5 w-5" />
              {isClient && cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-cream px-1 text-[10px] font-bold text-brand-dark">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              ) : null}
            </Link>
            <form action={signOutB2B.bind(null, locale)}>
              <button
                type="submit"
                className="flex min-h-[40px] items-center gap-1 rounded-lg px-3 text-sm text-cream/90 hover:bg-cream/15 hover:text-cream"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.signOut')}</span>
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/b2b/login"
            className="rounded-lg bg-cream/15 px-4 py-2 text-sm font-medium text-cream ring-1 ring-cream/35 hover:bg-cream/25"
          >
            {t('nav.signIn')}
          </Link>
        )}
      </div>
    </header>
  );
}
