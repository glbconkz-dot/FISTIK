import Image from 'next/image';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getCatalogData } from '@/lib/catalog';
import {
  DRINKS_HUB_SECTIONS,
  findDrinksCategory,
  getDrinksSectionProducts,
  type DrinksCategorySlug,
} from '@/lib/coffee';
import { coverImageForCategory } from '@/lib/category-utils';
import { cn, getLocalizedName } from '@/lib/utils';
import type { Locale } from '@/types';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'drinks' });
  return { title: t('title'), description: t('description') };
}

export default async function DrinksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('drinks');
  const tCoffee = await getTranslations('coffee');
  const tClassic = await getTranslations('classicCoffee');
  const tIced = await getTranslations('icedCoffee');
  const tChocolate = await getTranslations('chocolate');
  const tTea = await getTranslations('tea');
  const tOther = await getTranslations('otherDrinks');
  const { products, categories } = await getCatalogData();

  const copy = {
    coffee: tCoffee,
    classicCoffee: tClassic,
    icedCoffee: tIced,
    chocolate: tChocolate,
    tea: tTea,
    otherDrinks: tOther,
  };

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-md text-center sm:max-w-lg">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted">FISTIK</p>
        <h1 className="font-display mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t('heading')}
        </h1>
        <p className="mt-1 text-xs text-muted sm:text-sm">{t('subtitle')}</p>
        <Link
          href="/menu"
          className="mt-2.5 inline-block text-xs text-accent underline-offset-2 hover:underline sm:text-sm"
        >
          ← {t('backToMenu')}
        </Link>
      </div>

      <div className="mx-auto mt-8 max-w-md divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface sm:max-w-lg">
        {DRINKS_HUB_SECTIONS.map((section) => {
          const tSection = copy[section.i18n];
          const cat =
            section.categorySlug != null
              ? findDrinksCategory(categories, section.categorySlug)
              : undefined;
          const sectionProducts =
            section.categorySlug != null
              ? getDrinksSectionProducts(
                  products,
                  categories,
                  section.categorySlug as DrinksCategorySlug
                )
              : [];
          const cover = cat ? coverImageForCategory(cat, sectionProducts) : undefined;
          const name = cat
            ? getLocalizedName(cat, locale as Locale)
            : tSection('heading');
          const count = sectionProducts.length;
          const soon = Boolean(section.comingSoon);
          const href = section.href;

          const inner = (
            <>
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-cream ring-1 ring-border">
                {cover ? (
                  <Image src={cover} alt={name} fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-sm text-accent/40">
                    F
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                <p className="text-xs text-muted">
                  {soon
                    ? t('comingSoon')
                    : count > 0
                      ? t('itemCount', { count })
                      : t('comingSoon')}
                </p>
              </div>
              <span className="text-muted">{soon || !href ? '·' : '→'}</span>
            </>
          );

          if (soon || !href) {
            return (
              <div
                key={section.key}
                className="flex items-center gap-3 px-4 py-3 opacity-60"
              >
                {inner}
              </div>
            );
          }

          return (
            <Link
              key={section.key}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-pistachio-soft/40'
              )}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
