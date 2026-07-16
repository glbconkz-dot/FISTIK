'use client';

import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/ui/Reveal';
import { coverImageForDisplayCategory, getDisplayCategories } from '@/lib/category-display';
import { findCoffeeCategory, getCoffeeProducts } from '@/lib/coffee';
import { getLocalizedName } from '@/lib/utils';
import type { Category, Locale, Product } from '@/types';

interface CategoryShowcaseProps {
  categories: Category[];
  products: Product[];
  locale: Locale;
  title: string;
  /** Defaults to B2C /menu */
  menuPath?: '/menu' | '/b2b/menu';
}

function scrollToProducts() {
  requestAnimationFrame(() => {
    document.getElementById('all-products')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
}

export function CategoryShowcase({
  categories,
  products,
  locale,
  title,
  menuPath = '/menu',
}: CategoryShowcaseProps) {
  const t = useTranslations('drinks');
  const router = useRouter();
  const pathname = usePathname();
  const active = getDisplayCategories(categories);
  const showDrinksTile = menuPath === '/menu';

  const coffeeCat = findCoffeeCategory(categories);
  const coffeeCover =
    coffeeCat != null
      ? coverImageForDisplayCategory(coffeeCat, getCoffeeProducts(products, categories), categories)
      : undefined;

  if (active.length === 0 && !showDrinksTile) return null;

  const openCategory = (slug: string) => {
    const href = { pathname: menuPath, query: { cat: slug } };
    const opts = { scroll: false };

    if (pathname === menuPath) {
      router.replace(href, opts);
    } else {
      router.push(href, opts);
    }

    scrollToProducts();
  };

  return (
    <Reveal className="mb-14">
      <h2 className="section-title mb-5">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {active.map((cat, i) => {
          const cover = coverImageForDisplayCategory(cat, products, categories);
          const name = getLocalizedName(cat, locale);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => openCategory(cat.slug)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-cream text-left luxury-shadow transition-transform duration-300 hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {cover ? (
                <Image
                  src={cover}
                  alt={name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-brand/25" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <span className="absolute bottom-0 left-0 right-0 p-4 font-display text-lg font-semibold text-white">
                {name}
              </span>
            </button>
          );
        })}

        {showDrinksTile ? (
          <Link
            href="/drinks"
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-cream text-left luxury-shadow transition-transform duration-300 hover:-translate-y-0.5"
          >
            {coffeeCover ? (
              <Image
                src={coffeeCover}
                alt={t('sectionTitle')}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 bg-accent/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
            <span className="absolute bottom-0 left-0 right-0 p-4">
              <span className="block font-display text-lg font-semibold text-white">
                {t('sectionTitle')}
              </span>
              <span className="mt-0.5 block text-xs text-white/80">{t('sectionHint')}</span>
            </span>
          </Link>
        ) : null}
      </div>
    </Reveal>
  );
}
