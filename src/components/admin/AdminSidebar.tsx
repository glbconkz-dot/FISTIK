'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
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

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  external,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  external?: boolean;
}) {
  const className = cn(
    'flex min-h-[40px] items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium leading-tight transition-colors md:min-h-[42px] md:gap-2 md:px-3 md:text-sm',
    external
      ? 'border border-dashed border-brand-dark/40 text-accent hover:bg-pistachio-soft/50'
      : active
        ? 'bg-foreground text-background'
        : 'text-muted hover:bg-border/50 hover:text-foreground'
  );

  const content = (
    <>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { t, locale } = useAdminLocale();

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href));

  const links = [
    { href: '/admin', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/admin/products', label: t('products'), icon: Package },
    { href: '/admin/categories', label: t('categories'), icon: FolderTree },
    { href: '/admin/storefront', label: t('storefrontNav'), icon: Sparkles },
    { href: '/admin/orders', label: t('orders'), icon: ShoppingCart },
    { href: '/admin/b2b', label: t('b2bNav'), icon: Building2 },
  ];

  return (
    <aside className="flex w-full max-w-full flex-col overflow-hidden border-b border-border bg-surface md:w-52 md:min-h-screen md:border-b-0 md:border-r lg:w-56">
      <div className="border-b border-border p-3 md:p-4">
        <AdminBrand logoHeight={36} />
        <p className="mt-1 text-xs text-muted">{t('panelTitle')}</p>
        <div className="mt-2">
          <AdminLanguageSwitcher />
        </div>
      </div>

      <nav className="grid grid-cols-2 gap-1 p-2 md:flex md:flex-col md:gap-0.5">
        {links.map(({ href, label, icon }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={isActive(href)}
          />
        ))}

        <div className="col-span-2 md:col-span-1">
          <NavItem
            href={`/${locale}/menu`}
            label={t('backToStore')}
            icon={Store}
            active={false}
            external
          />
        </div>
      </nav>

      <div className="border-t border-border px-2 py-2 md:px-3">
        <p className="text-[10px] uppercase tracking-wide text-muted md:text-xs">{t('contactPhone')}</p>
        <a
          href={`https://wa.me/${BUSINESS.phoneWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 flex min-h-[36px] items-center gap-1.5 text-xs font-medium text-accent hover:underline md:text-sm"
        >
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{BUSINESS.phone}</span>
        </a>
      </div>

      <div className="mt-auto border-t border-border p-2">
        <form action={signOutAdmin}>
          <button
            type="submit"
            className="flex min-h-[40px] w-full items-center gap-2 rounded-lg px-2 text-xs text-muted hover:bg-red-50 hover:text-red-600 md:px-3 md:text-sm"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {t('signOut')}
          </button>
        </form>
      </div>
    </aside>
  );
}
