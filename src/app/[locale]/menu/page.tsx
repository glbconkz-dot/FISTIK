import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCatalogData } from '@/lib/catalog';
import { CatalogSection } from '@/components/CatalogSection';
import { HomeMenuSection } from '@/components/HomeMenuSection';
import { Reveal } from '@/components/ui/Reveal';
import type { Locale } from '@/types';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'menuPage' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('menuPage');

  const { products, categories } = await getCatalogData();

  return (
    <div>
      <Reveal className="mb-8 text-center sm:mb-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t('heading')}</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted sm:text-base">{t('subtitle')}</p>
      </Reveal>

      <HomeMenuSection categories={categories} products={products} locale={locale as Locale} />

      <CatalogSection products={products} categories={categories} locale={locale as Locale} />
    </div>
  );
}
