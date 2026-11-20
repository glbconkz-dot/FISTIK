import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { AppLocale } from '@/i18n/routing';
import { GateStamp, StageStamp } from '@/components/StudioMarks';
import { PROJECTS, gate } from '@/data/studio';
import { tx } from '@/lib/studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'projects' });
  return { title: t('title'), description: t('description') };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('projects');
  const stages = await getTranslations('stages');
  const loc = locale as AppLocale;

  return (
    <div className="pb-20 pt-12 sm:pt-16">
      <p className="label">{t('kicker')}</p>
      <h1 className="display mt-4 text-[clamp(2.8rem,7vw,5.5rem)] italic">{t('heading')}</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{t('intro')}</p>

      <div className="mt-12 sheet">
        <div className="hidden grid-cols-[7rem_1fr_8rem_7rem] gap-4 border-b border-rule px-5 py-3 sm:grid sm:px-6">
          <p className="label">{t('code')}</p>
          <p className="label">{t('name')}</p>
          <p className="label">{t('stage')}</p>
          <p className="label text-right">{t('gate')}</p>
        </div>
        <ul>
          {PROJECTS.map((project) => {
            const result = gate(project);
            return (
              <li key={project.id} className="border-b border-rule last:border-b-0">
                <Link
                  href={`/projects/${project.id}`}
                  className="grid gap-3 px-5 py-5 transition-colors hover:bg-stone/40 sm:grid-cols-[7rem_1fr_8rem_7rem] sm:items-center sm:px-6"
                >
                  <p className="label text-charcoal">{project.code}</p>
                  <div className="min-w-0">
                    <p className="font-display text-2xl leading-tight">{project.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {project.client}
                      <span className="mx-2">·</span>
                      {tx(project.city, loc)}
                    </p>
                    <p className="mt-2 text-xs text-muted sm:hidden">
                      {result.readyCount}/{result.requiredCount} {t('readyOf')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StageStamp label={stages(project.stage)} />
                    <p className="hidden text-xs text-muted sm:block">
                      {result.readyCount}/{result.requiredCount}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <GateStamp
                      open={result.canSubmitExpertise}
                      openLabel={t('gateOpen')}
                      closedLabel={t('gateClosed')}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
