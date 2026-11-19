import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { STUDIO } from '@/lib/studio';

const NAV = [
  { href: '/work' as const, key: 'work' },
  { href: '/practice' as const, key: 'practice' },
  { href: '/team' as const, key: 'team' },
  { href: '/services' as const, key: 'services' },
  { href: '/contact' as const, key: 'contact' },
];

export async function Header() {
  const t = await getTranslations('nav');

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link href="/" className="min-w-0">
          <p className="label text-muted">{STUDIO.shortName}</p>
          <p className="font-display text-xl leading-none tracking-tight sm:text-[1.35rem]">
            Architects
          </p>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="label text-muted transition-colors hover:text-charcoal"
            >
              {t(item.key)}
            </Link>
          ))}
          <LocaleSwitcher />
        </nav>

        <details className="relative lg:hidden">
          <summary className="label cursor-pointer list-none text-muted marker:content-none">
            {t('menu')}
          </summary>
          <div className="absolute right-0 top-full mt-3 w-56 border border-rule bg-paper p-4 shadow-[0_12px_40px_rgba(26,25,22,0.08)]">
            <div className="flex flex-col gap-3">
              {NAV.map((item) => (
                <Link key={item.key} href={item.href} className="label text-charcoal">
                  {t(item.key)}
                </Link>
              ))}
              <div className="border-t border-rule pt-3">
                <LocaleSwitcher />
              </div>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
