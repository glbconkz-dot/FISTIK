import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Reveal } from '@/components/ui/Reveal';
import {
  BUSINESS,
  getB2cFulfillmentBranchLabel,
  getBusinessAddress,
  getInstagramLink,
  getWhatsAppLink,
} from '@/lib/business';
import { BusinessLocations } from '@/components/BusinessLocations';
import type { Locale } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return { title: t('title'), description: t('description') };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('contact');
  const typedLocale = locale as Locale;
  const address = getBusinessAddress(typedLocale);
  const orderBranch = getB2cFulfillmentBranchLabel(typedLocale);

  return (
    <div className="mx-auto max-w-xl">
      <Reveal>
        <h1 className="section-title">{t('title')}</h1>
        <p className="mt-4 text-muted">{t('intro')}</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 space-y-4">
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="luxury-card flex items-center justify-between p-5 transition-transform hover:-translate-y-0.5"
        >
          <div>
            <p className="text-sm text-muted">{t('orderWhatsApp')}</p>
            <p className="mt-1 font-semibold">{BUSINESS.phone}</p>
            <p className="mt-1 text-xs text-muted">
              {t('orderWhatsAppHint', { branch: orderBranch })}
            </p>
          </div>
          <span className="text-2xl">→</span>
        </a>

        <a
          href={getInstagramLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="luxury-card flex items-center justify-between p-5 transition-transform hover:-translate-y-0.5"
        >
          <div>
            <p className="text-sm text-muted">Instagram</p>
            <p className="mt-1 font-semibold">@{BUSINESS.instagram.handle}</p>
          </div>
          <span className="text-2xl">→</span>
        </a>

        <div className="luxury-card p-5">
          <p className="text-sm text-muted">{t('address')}</p>
          <div className="mt-2">
            <BusinessLocations address={address} />
          </div>
        </div>

        <div className="luxury-card p-5">
          <p className="text-sm text-muted">{t('hours')}</p>
          <p className="mt-2 leading-relaxed">{t('hoursValue')}</p>
        </div>
      </Reveal>
    </div>
  );
}
