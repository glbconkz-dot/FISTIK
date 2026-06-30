import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCatalogData } from '@/lib/catalog';
import { CatalogSection } from '@/components/CatalogSection';
import { HeroCarousel } from '@/components/HeroCarousel';
import { HomeStorefront } from '@/components/HomeStorefront';
import { Reveal } from '@/components/ui/Reveal';
import type { Locale } from '@/types';

/** Canlı menü — Supabase stok/fiyat değişikliklerini anında yansıt */
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

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
      siteName: 'FISTIK',
    },
  };
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hero');

  const { products, categories, storefrontSections } = await getCatalogData();

  return (
    <div>
      <section className="mb-10 flex flex-col gap-6 sm:mb-12">
        <HeroCarousel locale={locale as Locale} />
        <Reveal className="flex flex-col items-center px-2 text-center">
          <p className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('tagline')}
          </p>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
            {t('subtitle')}
          </p>
        </Reveal>
      </section>

      <HomeStorefront
        products={products}
        categories={categories}
        storefrontSections={storefrontSections}
        locale={locale as Locale}
      />

      <CatalogSection
        products={products}
        categories={categories}
        locale={locale as Locale}
      />
    </div>
  );
}
