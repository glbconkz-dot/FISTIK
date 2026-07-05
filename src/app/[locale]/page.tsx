import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCatalogData } from '@/lib/catalog';
import { brandOpenGraphImage, SITE_NAME } from '@/lib/site-metadata';
import { CoverPageShell } from '@/components/CoverPageShell';
import { HomeStorefront } from '@/components/HomeStorefront';
import type { Locale } from '@/types';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale,
      siteName: SITE_NAME,
      images: [brandOpenGraphImage],
    },
    twitter: {
      card: 'summary',
      title: t('title'),
      description: t('description'),
      images: [brandOpenGraphImage.url],
    },
  };
}

export default async function CoverPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { products, storefrontSections } = await getCatalogData();

  return (
    <CoverPageShell>
      <div className="-mx-0 sm:-mx-0">
        <HomeStorefront
          products={products}
          storefrontSections={storefrontSections}
          locale={locale as Locale}
          fullPage
        />
      </div>
    </CoverPageShell>
  );
}
