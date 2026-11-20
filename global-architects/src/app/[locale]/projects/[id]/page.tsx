import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { AppLocale } from '@/i18n/routing';
import { GateStamp, StageRail, StatusMark } from '@/components/StudioMarks';
import {
  PIPELINE_ORDER,
  PROJECTS,
  findProject,
  gate,
  getDepartment,
  type StageId,
} from '@/data/studio';
import { tx } from '@/lib/studio';

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ id: project.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const project = findProject(id);
  if (!project) return {};
  const t = await getTranslations({ locale, namespace: 'projects' });
  return { title: `${project.code} ${project.name}`, description: t('description') };
}

export default async function PipelineProjectPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const project = findProject(id);
  if (!project) notFound();

  const loc = locale as AppLocale;
  const t = await getTranslations('projects');
  const stages = await getTranslations('stages');
  const statusT = await getTranslations('status');
  const deptT = await getTranslations('departments');
  const result = gate(project);
  const stageLabels = Object.fromEntries(
    PIPELINE_ORDER.map((stage) => [stage, stages(stage)]),
  ) as Record<StageId, string>;

  return (
    <article className="pb-20 pt-12 sm:pt-16">
      <Link href="/projects" className="label text-muted hover:text-charcoal">
        {t('back')}
      </Link>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="label">
            {project.code}
            <span className="mx-2">/</span>
            {t(`typologies.${project.typology}`)}
          </p>
          <h1 className="display mt-3 text-[clamp(2.6rem,6vw,5rem)] italic">{project.name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{tx(project.note, loc)}</p>
        </div>
        <GateStamp
          open={result.canSubmitExpertise}
          openLabel={t('gateOpen')}
          closedLabel={t('gateClosed')}
        />
      </div>

      <dl className="mt-10 grid gap-6 border-y border-rule py-8 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label={t('client')} value={project.client} />
        <Fact label={t('city')} value={tx(project.city, loc)} />
        <Fact label={t('year')} value={project.year} />
        <Fact label={t('stage')} value={stages(project.stage)} />
        {project.areaM2 ? (
          <Fact label={t('area')} value={`${project.areaM2.toLocaleString('tr-TR')} m²`} />
        ) : null}
        {project.plotHa ? <Fact label={t('plot')} value={`${project.plotHa} ha`} /> : null}
        {project.floors ? <Fact label={t('floors')} value={project.floors} /> : null}
        <Fact
          label={t('readyOf')}
          value={`${result.readyCount} / ${result.requiredCount}`}
        />
      </dl>

      <section className="mt-12">
        <h2 className="font-display text-3xl">{t('pipeline')}</h2>
        <div className="mt-6">
          <StageRail current={project.stage} labels={stageLabels} />
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className={`sheet p-6 sm:p-8 ${result.canSubmitExpertise ? '' : 'border-stamp/40'}`}>
          <p className="label">{t('gate')}</p>
          <p className="mt-3 font-display text-3xl leading-tight">
            {result.canSubmitExpertise ? t('canSubmit') : t('cannotSubmit')}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{t('nextAction')}</p>
          {result.blocking.length > 0 ? (
            <ul className="mt-6 space-y-3">
              {result.blocking.map((item) => {
                const department = getDepartment(item.owner);
                return (
                  <li key={item.code} className="flex items-baseline justify-between gap-3 border-t border-rule pt-3">
                    <div>
                      <p className="font-display text-xl">
                        {item.code}
                        <span className="ml-2 text-base text-muted">{tx(item.name, loc)}</span>
                      </p>
                      {department ? (
                        <p className="mt-1 text-xs text-muted">{tx(department.name, loc)}</p>
                      ) : null}
                    </div>
                    <StatusMark status={item.status} label={statusT(item.status)} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-6 text-sm ready">{t('blockingEmpty')}</p>
          )}
        </div>
        <div className="sheet p-6 sm:p-8">
          <p className="label">{t('warningsTitle')}</p>
          <p className="mt-3 font-display text-3xl leading-tight">{t('optional')}</p>
          {result.warnings.length > 0 ? (
            <ul className="mt-6 space-y-3">
              {result.warnings.map((item) => (
                <li key={item.code} className="flex items-baseline justify-between gap-3 border-t border-rule pt-3">
                  <p className="font-display text-xl">
                    {item.code}
                    <span className="ml-2 text-base text-muted">{tx(item.name, loc)}</span>
                  </p>
                  <StatusMark status={item.status} label={statusT(item.status)} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted">{t('warningsEmpty')}</p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">{t('album')}</h2>
        <div className="mt-6 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {project.sections.map((section) => {
            const department = getDepartment(section.owner);
            return (
              <div key={section.code} className="bg-surface p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-2xl">{section.code}</p>
                  <StatusMark status={section.status} label={statusT(section.status)} />
                </div>
                <p className="mt-2 text-sm">{tx(section.name, loc)}</p>
                <p className="mt-3 label">
                  {section.requiredForExpertise ? t('required') : t('optional')}
                  {department ? (
                    <>
                      <span className="mx-2">/</span>
                      {tx(department.name, loc)}
                    </>
                  ) : null}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-6">
        {project.workSlug ? (
          <Link href={`/work/${project.workSlug}`} className="border-b border-charcoal pb-1 text-sm tracking-wide">
            {t('workLink')}
          </Link>
        ) : null}
        <Link href="/departments" className="border-b border-charcoal pb-1 text-sm tracking-wide">
          {deptT('heading')}
        </Link>
        <Link href="/playbook" className="border-b border-charcoal pb-1 text-sm tracking-wide">
          {t('playbookLink')}
        </Link>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label">{label}</dt>
      <dd className="mt-2 text-sm leading-relaxed">{value}</dd>
    </div>
  );
}
