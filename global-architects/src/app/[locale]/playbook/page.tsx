import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { AppLocale } from '@/i18n/routing';
import { PLAYBOOK } from '@/data/studio';
import { tx } from '@/lib/studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'playbook' });
  return { title: t('title'), description: t('description') };
}

export default async function PlaybookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('playbook');
  const loc = locale as AppLocale;

  return (
    <div className="pb-20 pt-12 sm:pt-16">
      <p className="label">{t('kicker')}</p>
      <h1 className="display mt-4 text-[clamp(2.8rem,7vw,5.5rem)] italic">{t('heading')}</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{t('intro')}</p>

      <ol className="mt-12 space-y-0 border-y border-rule">
        {PLAYBOOK.map((step) => (
          <li key={step.id} className="grid gap-4 border-b border-rule py-10 last:border-b-0 md:grid-cols-[5rem_1fr]">
            <p className="label pt-2">{step.index}</p>
            <div>
              <h2 className="font-display text-3xl leading-tight">{tx(step.title, loc)}</h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{tx(step.body, loc)}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div className="sheet p-6 sm:p-8">
          <p className="label">{t('gateKicker')}</p>
          <h2 className="mt-3 font-display text-3xl leading-tight">{t('gateTitle')}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">{t('gateNote')}</p>
          <Link href="/projects/halavet" className="mt-6 inline-block border-b border-charcoal pb-1 text-sm">
            {t('halavetCta')}
          </Link>
        </div>
        <div className="sheet p-6 sm:p-8">
          <p className="label">{t('githubKicker')}</p>
          <h2 className="mt-3 font-display text-3xl leading-tight">{t('githubTitle')}</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">{t('githubBody')}</p>
          <pre className="mt-6 overflow-x-auto text-xs leading-relaxed text-muted">
            {`00-brief/\n01-concept/\n02-sketch-ep/\n03-working-rp/\n04-expertise/\n05-as-built/`}
          </pre>
        </div>
      </section>
    </div>
  );
}
