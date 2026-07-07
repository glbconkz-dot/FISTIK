'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { cn } from '@/lib/utils';

export function B2BAdminNav() {
  const { t } = useAdminLocale();
  const pathname = usePathname();

  const links = [
    { href: '/admin/b2b', label: t('b2bNavCustomers') },
    { href: '/admin/b2b/prices', label: t('b2bNavPrices') },
    { href: '/admin/b2b/reports', label: t('b2bNavReports') },
    { href: '/admin/b2b/new', label: t('b2bAddCustomer') },
  ];

  return (
    <nav className="mb-6 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'rounded-lg border px-2 py-1.5 text-center text-xs font-medium transition-colors sm:px-3 sm:py-2 sm:text-left sm:text-sm',
            pathname === href || (href !== '/admin/b2b' && pathname.startsWith(href))
              ? 'border-foreground bg-foreground text-background'
              : 'border-border text-muted hover:text-foreground'
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
