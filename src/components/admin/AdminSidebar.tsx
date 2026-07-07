'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  FolderTree,
  Sparkles,
  Building2,
  Store,
  Phone,
} from 'lucide-react';
import { AdminBrand } from '@/components/admin/AdminBrand';
import { AdminLanguageSwitcher } from '@/components/admin/AdminLanguageSwitcher';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { signOutAdmin } from '@/app/actions/orders';
import { BUSINESS } from '@/lib/business';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();
  const { t, locale } = useAdminLocale();

  const links = [
    { href: '/admin', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/admin/products', label: t('products'), icon: Package },
    { href: '/admin/categories', label: t('categories'), icon: FolderTree },
    { href: '/admin/storefront', label: t('storefront'), icon: Sparkles },
    { href: '/admin/orders', label: t('orders'), icon: ShoppingCart },
    { href: '/admin/b2b', label: t('b2b'), icon: Building2 },
  ];

  return (
    <aside className="flex w-full flex-col border-b border-border bg-surface md:min-h-screen md:w-56 md:border-b-0 md:border-r">
      <div className="border-b border-border p-4">
        <AdminBrand logoHeight={40} />
        <p className="mt-1 text-xs text-muted">{t('panelTitle')}</p>
        <div className="mt-3">
          <AdminLanguageSwitcher />
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col md:overflow-visible">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
              pathname === href || (href !== '/admin' && pathname.startsWith(href))
                ? 'bg-foreground text-background'
                : 'text-muted hover:bg-border/50 hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}

        <a
          href={`/${locale}/menu`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg border border-dashed border-brand-dark/40 px-3 text-sm font-medium text-accent hover:bg-pistachio-soft/50"
        >
          <Store className="h-4 w-4" />
          {t('backToStore')}
        </a>
      </nav>

      <div className="border-t border-border px-3 py-3">
        <p className="text-xs text-muted">{t('contactPhone')}</p>
        <a
          href={`https://wa.me/${BUSINESS.phoneWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex min-h-[40px] items-center gap-2 text-sm font-medium text-accent hover:underline"
        >
          <Phone className="h-4 w-4 shrink-0" />
          {BUSINESS.phone}
        </a>
      </div>

      <div className="mt-auto border-t border-border p-2">
        <form action={signOutAdmin}>
          <button
            type="submit"
            className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-sm text-muted hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            {t('signOut')}
          </button>
        </form>
      </div>
    </aside>
  );
}
