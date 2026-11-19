import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ADDRESS, STUDIO } from '@/lib/studio';
import { getStudioWhatsAppLink } from '@/lib/whatsapp';
import type { AppLocale } from '@/i18n/routing';

export async function Footer() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations('footer');
  const nav = await getTranslations('nav');
  const lines = ADDRESS[locale];

  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <p className="label">{STUDIO.name}</p>
          <p className="mt-4 font-display text-3xl leading-none">{STUDIO.constructionName}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{t('blurb')}</p>
        </div>
        <div>
          <p className="label">{t('studio')}</p>
          <p className="mt-4 text-sm leading-relaxed">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          <p className="mt-4 text-sm">
            <a className="underline-offset-4 hover:underline" href={`tel:+${STUDIO.phoneWhatsApp}`}>
              {STUDIO.phoneDisplay}
            </a>
            <span className="block">
              <a className="underline-offset-4 hover:underline" href={`mailto:${STUDIO.email}`}>
                {STUDIO.email}
              </a>
            </span>
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <p className="label">{t('start')}</p>
          <Link href="/brief" className="font-display text-2xl leading-none">
            {t('brief')}
          </Link>
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
            <Link href="/projects" className="text-sm text-muted hover:text-charcoal">
              {nav('studio')}
            </Link>
            <Link href="/departments" className="text-sm text-muted hover:text-charcoal">
              {nav('departments')}
            </Link>
            <Link href="/agents" className="text-sm text-muted hover:text-charcoal">
              {nav('agents')}
            </Link>
            <Link href="/playbook" className="text-sm text-muted hover:text-charcoal">
              {nav('playbook')}
            </Link>
            <Link href="/work" className="text-sm text-muted hover:text-charcoal">
              {nav('work')}
            </Link>
            <Link href="/team" className="text-sm text-muted hover:text-charcoal">
              {nav('team')}
            </Link>
            <Link href="/services" className="text-sm text-muted hover:text-charcoal">
              {nav('services')}
            </Link>
          </div>
          <a
            href={getStudioWhatsAppLink()}
            className="text-sm text-muted underline-offset-4 hover:underline"
            rel="noopener noreferrer"
          >
            WhatsApp {STUDIO.phoneDisplay}
          </a>
        </div>
      </div>
      <div className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs tracking-wide text-muted sm:px-8">
          <span>
            {STUDIO.name} · {t('license')}
          </span>
          <span>{t('drawings')}</span>
        </div>
      </div>
    </footer>
  );
}
