import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCatalogData } from '@/lib/catalog';
import { CatalogClient } from '@/components/CatalogClient';
import { HeroCarousel } from '@/components/HeroCarousel';
import type { Locale } from '@/types';

/** Canlı menü — Supabase stok/fiyat değişikliklerini anında yansıt */
export const dynamic = 'force-dynamic';

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
      <section className="mb-8 flex flex-col gap-5">
        <HeroCarousel locale={locale as Locale} />
        <div className="flex flex-col items-center text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted">
            {t('tagline')}
          </p>
          <p className="mt-2 max-w-md text-muted">{t('subtitle')}</p>
        </div>
      </section>

      <CatalogClient
        products={products}
        categories={categories}
        locale={locale as Locale}
      />
    </div>
  );
}
