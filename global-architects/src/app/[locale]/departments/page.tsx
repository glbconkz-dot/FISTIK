import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { AppLocale } from '@/i18n/routing';
import { DEPARTMENTS } from '@/data/studio';
import { tx } from '@/lib/studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'departments' });
  return { title: t('title'), description: t('description') };
}

export default async function DepartmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('departments');
  const loc = locale as AppLocale;

  return (
    <div className="pb-20 pt-12 sm:pt-16">
      <p className="label">{t('kicker')}</p>
      <h1 className="display mt-4 text-[clamp(2.8rem,7vw,5.5rem)] italic">{t('heading')}</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{t('intro')}</p>

      <ol className="mt-12 divide-y divide-rule border-y border-rule">
        {DEPARTMENTS.map((department) => (
          <li key={department.id} className="grid gap-4 py-8 md:grid-cols-[5.5rem_1fr_1.2fr]">
            <p className="label pt-2">{department.code}</p>
            <div>
              <h2 className="font-display text-3xl leading-tight">{tx(department.name, loc)}</h2>
              <p className="mt-2 text-sm text-muted">
                {t('lead')}: {tx(department.lead, loc)}
              </p>
              {department.codes.length > 0 ? (
                <p className="mt-3 label text-charcoal">{department.codes.join(' · ')}</p>
              ) : (
                <p className="mt-3 label">{t('gateOwner')}</p>
              )}
            </div>
            <div>
              <p className="text-base leading-relaxed text-muted">{tx(department.summary, loc)}</p>
              {department.agent ? (
                <Link href="/agents" className="mt-4 inline-block text-sm tracking-wide text-muted hover:text-charcoal">
                  {t('agentsCta')}
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
