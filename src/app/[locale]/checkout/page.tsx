import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { BackToMenuBanner } from '@/components/BackToMenuBanner';
import { CheckoutWizard } from '@/components/CheckoutWizard';
import type { Locale } from '@/types';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('checkout');

  return (
    <div>
      <BackToMenuBanner title={t('forgotSomething')} linkLabel={t('backToMenu')} />

      <h1 className="font-display mb-6 text-3xl font-bold">{t('title')}</h1>
      <CheckoutWizard locale={locale as Locale} />
    </div>
  );
}
