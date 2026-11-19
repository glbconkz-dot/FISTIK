import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { TEAM } from '@/lib/team';
import { tx } from '@/lib/studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'team' });
  return { title: t('title'), description: t('description') };
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('team');
  const loc = locale as AppLocale;

  return (
    <div className="pb-20 pt-12 sm:pt-16">
      <p className="label">{t('kicker')}</p>
      <h1 className="display mt-4 text-[clamp(2.8rem,7vw,5.5rem)] italic">{t('heading')}</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{t('intro')}</p>

      <ul className="mt-12 divide-y divide-rule border-y border-rule">
        {TEAM.map((member) => {
          const name = tx(member.name, loc);
          const initials = name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join('');
          return (
            <li key={member.id} className="grid items-baseline gap-3 py-6 sm:grid-cols-[4.5rem_1fr_1fr]">
              <span className="font-display text-2xl text-muted">{initials}</span>
              <div>
                <p className="font-display text-2xl leading-tight sm:text-3xl">{name}</p>
                <p className="mt-1 text-sm text-muted">{tx(member.role, loc)}</p>
              </div>
              <p className="text-sm text-muted sm:text-right">
                {member.experience ? tx(member.experience, loc) : t('studio')}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
