'use client';

import { Lock, ShoppingBag } from 'lucide-react';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BrandLink } from '@/components/Brand';
import { InstagramIcon } from '@/components/InstagramIcon';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getInstagramLink } from '@/lib/business';
import { useIsClient } from '@/hooks/use-is-client';
import { useCartStore } from '@/stores/cart';

export function Header() {
  const t = useTranslations('nav');
  const isClient = useIsClient();
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-brand">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:py-4">
        <BrandLink wordmark />

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <NextLink
            href="/admin/login"
            className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-border/80 bg-surface/80 px-3 text-xs font-medium text-muted hover:border-foreground/20 hover:text-foreground sm:min-w-[44px] sm:justify-center sm:px-0"
            aria-label={t('admin')}
            title={t('admin')}
          >
            <Lock className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">{t('admin')}</span>
          </NextLink>
          <a
            href={getInstagramLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border bg-surface text-foreground hover:bg-brand/40"
            aria-label={t('instagram')}
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
          <Link
            href="/cart"
            className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border bg-surface"
            aria-label={t('cart')}
          >
            <ShoppingBag className="h-5 w-5" />
            {isClient && totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-surface">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
