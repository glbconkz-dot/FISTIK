import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCatalogData } from '@/lib/catalog';
import { CatalogClient } from '@/components/CatalogClient';
import { HeroSweetSpotlight } from '@/components/HeroSweetSpotlight';
import type { Locale } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('title'), description: t('description') };
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hero');

  const { products, categories } = await getCatalogData();

  return (
    <div>
      <section className="mb-8 flex flex-col items-center text-center">
        <HeroSweetSpotlight />
        <p className="mt-5 text-sm font-medium uppercase tracking-[0.2em] text-muted">
          {t('tagline')}
        </p>
        <p className="mt-2 max-w-md text-muted">{t('subtitle')}</p>
      </section>

      <CatalogClient
        products={products}
        categories={categories}
        locale={locale as Locale}
      />
    </div>
  );
}
