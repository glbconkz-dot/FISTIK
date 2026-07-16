import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { CoffeeMenuBoard } from '@/components/CoffeeMenuBoard';
import { getCatalogData } from '@/lib/catalog';
import { getClassicCoffeeProducts } from '@/lib/coffee';
import type { Locale } from '@/types';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'classicCoffee' });
  return { title: t('title'), description: t('description') };
}

export default async function ClassicCoffeePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('classicCoffee');
  const { products, categories } = await getCatalogData();
  const classicProducts = getClassicCoffeeProducts(products, categories);

  return (
    <div className="pb-8">
      <div className="mx-auto max-w-md text-center sm:max-w-lg">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted">FISTIK</p>
        <h1 className="font-display mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t('heading')}
        </h1>
        <p className="mt-1 text-xs text-muted sm:text-sm">{t('subtitle')}</p>
        <Link
          href="/drinks"
          className="mt-2.5 inline-block text-xs text-accent underline-offset-2 hover:underline sm:text-sm"
        >
          ← {t('backToDrinks')}
        </Link>
      </div>

      <div className="mt-6">
        {classicProducts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">{t('empty')}</p>
        ) : (
          <CoffeeMenuBoard products={classicProducts} locale={locale as Locale} />
        )}
      </div>
    </div>
  );
}
