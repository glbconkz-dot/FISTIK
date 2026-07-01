import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Reveal } from '@/components/ui/Reveal';
import { getBusinessAddress, getInstagramLink } from '@/lib/business';
import type { Locale } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });
  return { title: t('title'), description: t('description') };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const address = getBusinessAddress(locale as Locale);

  return (
    <div className="mx-auto max-w-2xl">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted">
          FISTIK
        </p>
        <h1 className="section-title mt-2">{t('title')}</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">{t('intro')}</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 space-y-6">
        <div className="luxury-card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">{t('storyTitle')}</h2>
          <p className="mt-3 leading-relaxed text-muted">{t('story')}</p>
        </div>

        <div className="luxury-card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">{t('craftTitle')}</h2>
          <p className="mt-3 leading-relaxed text-muted">{t('craft')}</p>
        </div>

        <div className="luxury-card p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold">{t('locationTitle')}</h2>
          <p className="mt-3 font-medium">{address.legalName}</p>
          {address.lines.map((line) => (
            <p key={line} className="text-muted">
              {line}
            </p>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.2} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/menu" className="btn-primary text-center">
          {t('orderCta')}
        </Link>
        <a
          href={getInstagramLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline text-center"
        >
          Instagram
        </a>
      </Reveal>
    </div>
  );
}
