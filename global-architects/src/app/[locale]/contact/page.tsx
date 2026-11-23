import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { BriefForm } from '@/components/BriefForm';
import { ADDRESS, STUDIO } from '@/lib/studio';
import { getStudioWhatsAppLink } from '@/lib/whatsapp';

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
  const loc = locale as AppLocale;
  const lines = ADDRESS[loc];

  return (
    <div className="pb-20 pt-12 sm:pt-16">
      <p className="label">{t('kicker')}</p>
      <h1 className="display mt-4 text-[clamp(2.8rem,7vw,5.5rem)] italic">{t('heading')}</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{t('intro')}</p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="border border-rule p-6 sm:p-8">
          <p className="label">{t('studio')}</p>
          <p className="mt-4 font-display text-3xl leading-tight">{STUDIO.name}</p>
          <p className="mt-4 text-sm leading-relaxed">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          <p className="mt-6 text-sm">
            <a className="block underline-offset-4 hover:underline" href={`tel:+${STUDIO.phoneWhatsApp}`}>
              {STUDIO.phoneDisplay}
            </a>
            <a className="mt-2 block underline-offset-4 hover:underline" href={`mailto:${STUDIO.email}`}>
              {STUDIO.email}
            </a>
            <a
              className="mt-2 block underline-offset-4 hover:underline"
              href={getStudioWhatsAppLink()}
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </p>
          <p className="mt-8 text-sm leading-relaxed text-muted">{t('hours')}</p>
        </aside>

        <BriefForm locale={loc} />
      </div>
    </div>
  );
}
