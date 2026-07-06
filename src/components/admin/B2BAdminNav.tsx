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
    { href: '/admin/b2b/new', label: t('b2bAddCustomer') },
  ];

  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
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
