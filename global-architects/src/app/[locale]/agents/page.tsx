import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { AGENTS, getDepartment } from '@/data/studio';
import { tx } from '@/lib/studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'agents' });
  return { title: t('title'), description: t('description') };
}

export default async function AgentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('agents');
  const loc = locale as AppLocale;

  return (
    <div className="pb-20 pt-12 sm:pt-16">
      <p className="label">{t('kicker')}</p>
      <h1 className="display mt-4 text-[clamp(2.8rem,7vw,5.5rem)] italic">{t('heading')}</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{t('intro')}</p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{t('validateHint')}</p>

      <ul className="mt-12 grid gap-6 lg:grid-cols-2">
        {AGENTS.map((agent) => {
          const department =
            agent.department === 'parent' ? null : getDepartment(agent.department);
          return (
            <li key={agent.id} className="sheet p-6 sm:p-8">
              <p className="label">
                {agent.id === 'parent' ? t('parent') : department ? tx(department.name, loc) : agent.id}
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight">{tx(agent.role, loc)}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">{tx(agent.summary, loc)}</p>
              <div className="mt-6 border-t border-rule pt-4">
                <p className="label">{t('skills')}</p>
                <p className="mt-2 text-sm">{agent.skills.join(' · ')}</p>
              </div>
              <div className="mt-4">
                <p className="label">{t('tools')}</p>
                <p className="mt-2 text-sm blueprint">{agent.tools.join(' · ')}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
