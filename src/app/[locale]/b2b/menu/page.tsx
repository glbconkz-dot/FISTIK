import { redirect } from '@/i18n/routing';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getB2BCustomerSession } from '@/lib/b2b/customer';
import { getB2BCatalogData } from '@/lib/b2b/catalog';
import { B2BCatalogSection } from '@/components/b2b/B2BCatalogSection';
import { HomeMenuSection } from '@/components/HomeMenuSection';
import { Reveal } from '@/components/ui/Reveal';
import type { Locale } from '@/types';

export const revalidate = 60;

export default async function B2BMenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const customer = await getB2BCustomerSession();
  const t = await getTranslations('b2b');

  if (!customer) {
    redirect({ href: '/b2b/login', locale });
  }

  if (!customer.terms_accepted_at) {
    redirect({ href: '/b2b/terms', locale });
  }

  const { products, categories } = await getB2BCatalogData();

  return (
    <div>
      <Reveal className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          {t('menu.welcome', { company: customer.company_name })}
        </h1>
        {customer.discount_tier > 0 ? (
          <p className="mt-2 text-sm text-accent">
            {t('menu.discountActive', { percent: customer.discount_tier })}
          </p>
        ) : null}
      </Reveal>

      <HomeMenuSection
        categories={categories}
        products={products}
        locale={locale as Locale}
        menuPath="/b2b/menu"
      />

      <B2BCatalogSection
        products={products}
        categories={categories}
        locale={locale as Locale}
      />
    </div>
  );
}
