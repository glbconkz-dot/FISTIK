import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { AppLocale } from '@/i18n/routing';
import { SERVICES } from '@/lib/services';
import { tx } from '@/lib/studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services' });
  return { title: t('title'), description: t('description') };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('services');
  const loc = locale as AppLocale;

  return (
    <div className="pb-20 pt-12 sm:pt-16">
      <p className="label">{t('kicker')}</p>
      <h1 className="display mt-4 text-[clamp(2.8rem,7vw,5.5rem)] italic">{t('heading')}</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{t('intro')}</p>

      <ol className="mt-12 divide-y divide-rule border-y border-rule">
        {SERVICES.map((service) => (
          <li key={service.id} className="grid gap-4 py-8 md:grid-cols-[5rem_1fr_1.4fr]">
            <p className="label pt-2">{service.index}</p>
            <h2 className="font-display text-3xl leading-tight">{tx(service.title, loc)}</h2>
            <p className="text-base leading-relaxed text-muted">{tx(service.body, loc)}</p>
          </li>
        ))}
      </ol>

      <Link
        href="/contact"
        className="mt-12 inline-block bg-charcoal px-6 py-3 text-sm tracking-[0.16em] text-paper uppercase"
      >
        {t('cta')}
      </Link>
    </div>
  );
}
