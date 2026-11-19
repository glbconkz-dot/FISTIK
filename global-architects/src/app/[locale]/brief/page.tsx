import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { BriefForm } from '@/components/BriefForm';
import { ADDRESS, STUDIO } from '@/lib/studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'brief' });
  return { title: t('pageTitle'), description: t('pageDescription') };
}

export default async function BriefPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('brief');
  const loc = locale as AppLocale;
  const lines = ADDRESS[loc];

  return (
    <div className="pb-20 pt-12 sm:pt-16">
      <p className="label">{t('pageKicker')}</p>
      <h1 className="display mt-4 text-[clamp(2.8rem,7vw,5.5rem)] italic">{t('pageHeading')}</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{t('pageIntro')}</p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="sheet p-6 sm:p-8">
          <p className="label">{t('pipeline')}</p>
          <ol className="mt-6 space-y-4 text-sm leading-relaxed">
            <li>
              <span className="label block">01</span>
              {t('stepConcept')}
            </li>
            <li>
              <span className="label block">02</span>
              {t('stepSketch')}
            </li>
            <li>
              <span className="label block">03</span>
              {t('stepWorking')}
            </li>
          </ol>
          <p className="mt-8 text-sm leading-relaxed text-muted">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          <p className="mt-4 text-sm">{STUDIO.phoneDisplay}</p>
        </aside>
        <BriefForm locale={loc} />
      </div>
    </div>
  );
}
