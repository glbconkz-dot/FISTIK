import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { MassingDrawing } from '@/components/MassingDrawing';
import { STUDIO } from '@/lib/studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'practice' });
  return { title: t('title'), description: t('description') };
}

export default async function PracticePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('practice');

  return (
    <div className="pb-20 pt-12 sm:pt-16">
      <p className="label">{t('kicker')}</p>
      <h1 className="display mt-4 max-w-4xl text-[clamp(2.8rem,7vw,5.5rem)] italic">{t('heading')}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{t('intro')}</p>

      <div className="mt-12">
        <MassingDrawing kind="hq-pavilion" title={t('heading')} className="aspect-[16/8]" />
      </div>

      <section className="mt-14 grid gap-10 border-t border-rule pt-12 md:grid-cols-2">
        <div className="prose-studio max-w-xl text-base leading-relaxed">
          <p>{t('body1')}</p>
          <p>{t('body2')}</p>
          <p>{t('body3')}</p>
        </div>
        <dl className="space-y-6 border border-rule p-6 sm:p-8">
          <div>
            <dt className="label">{t('license')}</dt>
            <dd className="mt-2 font-display text-3xl">{t('licenseValue', { category: STUDIO.licenseCategory })}</dd>
          </div>
          <div>
            <dt className="label">{t('director')}</dt>
            <dd className="mt-2 font-display text-3xl">Okan Yeşilgöz</dd>
            <dd className="mt-1 text-sm text-muted">{t('directorYears', { years: STUDIO.directorYears })}</dd>
          </div>
          <div>
            <dt className="label">{STUDIO.constructionName}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted">{t('construction')}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-14 border-t border-rule pt-12">
        <h2 className="font-display text-4xl">{t('methodTitle')}</h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {(['m1', 'm2', 'm3'] as const).map((key, index) => (
            <li key={key} className="border-t border-rule pt-4">
              <p className="label">0{index + 1}</p>
              <p className="mt-3 font-display text-2xl">{t(`${key}Title`)}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t(`${key}Body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-16 flex flex-wrap gap-6">
        <Link href="/team" className="border-b border-charcoal pb-1 text-sm tracking-wide">
          {t('teamCta')}
        </Link>
        <Link href="/contact" className="border-b border-charcoal pb-1 text-sm tracking-wide">
          {t('briefCta')}
        </Link>
      </div>
    </div>
  );
}
