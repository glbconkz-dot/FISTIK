import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { BackToMenuBanner } from '@/components/BackToMenuBanner';
import { CartContent } from '@/components/CartContent';

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cart');

  return (
    <div>
      <BackToMenuBanner title={t('continueShopping')} linkLabel={t('backToMenu')} />
      <h1 className="font-display mb-6 text-3xl font-bold">{t('title')}</h1>
      <CartContent />
    </div>
  );
}
