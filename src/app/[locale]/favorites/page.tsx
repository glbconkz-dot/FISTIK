import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { getCatalogData } from '@/lib/catalog';
import { FavoritesClient } from '@/components/FavoritesClient';
import type { Locale } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'favorites' });
  return { title: t('title'), description: t('description') };
}

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('favorites');

  const { products, categories } = await getCatalogData();

  return (
    <div>
      <h1 className="section-title mb-2">{t('title')}</h1>
      <p className="mb-8 text-sm text-muted">{t('subtitle')}</p>
      <FavoritesClient
        products={products}
        categories={categories}
        locale={locale as Locale}
      />
    </div>
  );
}
