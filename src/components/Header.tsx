'use client';

import { useState } from 'react';
import { Heart, Lock, Building2, Menu, ShoppingBag, X } from 'lucide-react';
import NextLink from 'next/link';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { BrandLink } from '@/components/Brand';
import { InstagramIcon } from '@/components/InstagramIcon';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getInstagramLink } from '@/lib/business';
import { cn } from '@/lib/utils';
import { useIsClient } from '@/hooks/use-is-client';
import { useCartStore } from '@/stores/cart';
import { useFavoritesStore } from '@/stores/favorites';

const navLinks = [
  { href: '/menu', key: 'menu' as const },
  { href: '/favorites', key: 'favorites' as const },
  { href: '/about', key: 'about' as const },
  { href: '/contact', key: 'contact' as const },
];

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const isClient = useIsClient();
  const totalItems = useCartStore((s) => s.totalItems());
  const favCount = useFavoritesStore((s) => s.count());
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-brand-dark/35 bg-brand">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-3.5">
          <BrandLink wordmark />

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  pathname === href || pathname.startsWith(`${href}/`)
                    ? 'bg-cream/95 text-accent'
                    : 'text-cream/90 hover:bg-cream/15 hover:text-cream'
                )}
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <Link
              href="/favorites"
              className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-brand-dark/30 bg-surface/95 text-accent md:hidden"
              aria-label={t('favorites')}
            >
              <Heart className="h-5 w-5" strokeWidth={1.75} />
              {isClient && favCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-surface">
                  {favCount > 9 ? '9+' : favCount}
                </span>
              )}
            </Link>
            <Link
              href="/b2b/login"
              className="hidden min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-brand-dark/30 bg-surface/95 px-3 text-xs font-medium text-accent/80 hover:text-accent sm:flex"
              aria-label={t('b2b')}
              title={t('b2b')}
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden lg:inline">{t('b2b')}</span>
            </Link>
            <NextLink
              href="/admin/login"
              className="hidden min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-brand-dark/30 bg-surface/95 px-3 text-xs font-medium text-accent/80 hover:text-accent sm:flex"
              aria-label={t('admin')}
              title={t('admin')}
            >
              <Lock className="h-4 w-4" />
              <span className="hidden lg:inline">{t('admin')}</span>
            </NextLink>
            <a
              href={getInstagramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-brand-dark/30 bg-surface/95 text-accent hover:bg-surface sm:flex"
              aria-label={t('instagram')}
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <Link
              href="/cart"
              className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-brand-dark/30 bg-surface/95 text-accent"
              aria-label={t('cart')}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
              {isClient && totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-surface">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-brand-dark/30 bg-surface/95 text-accent md:hidden"
              aria-label={t('menu')}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="font-display text-lg font-semibold">FISTIK</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-cream"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map(({ href, key }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'rounded-xl px-4 py-3.5 text-base font-medium',
                    pathname === href || pathname.startsWith(`${href}/`)
                      ? 'bg-foreground text-surface'
                      : 'hover:bg-cream'
                  )}
                >
                  {t(key)}
                </Link>
              ))}
              <a
                href={getInstagramLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl px-4 py-3.5 text-base font-medium hover:bg-cream"
              >
                Instagram
              </a>
              <Link
                href="/b2b/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3.5 text-base font-medium text-muted hover:bg-cream"
              >
                {t('b2b')}
              </Link>
              <NextLink
                href="/admin/login"
                className="rounded-xl px-4 py-3.5 text-base font-medium text-muted hover:bg-cream"
              >
                {t('admin')}
              </NextLink>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
