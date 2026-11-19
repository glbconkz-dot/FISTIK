import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { AppLocale } from '@/i18n/routing';
import { MassingDrawing } from '@/components/MassingDrawing';
import { ProjectCard } from '@/components/ProjectCard';
import {
  CATEGORIES,
  getProject,
  getRelatedProjects,
  PROJECTS,
} from '@/lib/projects';
import { tx } from '@/lib/studio';

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const loc = locale as AppLocale;
  return {
    title: tx(project.title, loc),
    description: tx(project.summary, loc),
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = getProject(slug);
  if (!project) notFound();

  const loc = locale as AppLocale;
  const t = await getTranslations('project');
  const category = CATEGORIES.find((item) => item.id === project.category);
  const related = getRelatedProjects(slug, loc);

  return (
    <article className="pb-20 pt-12 sm:pt-16">
      <Link href="/work" className="label text-muted hover:text-charcoal">
        {t('back')}
      </Link>
      <p className="mt-8 label">
        {category ? tx(category.label, loc) : project.category}
        <span className="mx-2">/</span>
        {project.yearLabel}
      </p>
      <h1 className="display mt-4 max-w-5xl text-[clamp(2.6rem,6vw,5rem)] italic">
        {tx(project.title, loc)}
      </h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">{tx(project.summary, loc)}</p>

      <div className="mt-10">
        <MassingDrawing
          kind={project.drawing}
          title={tx(project.title, loc)}
          className="aspect-[16/9]"
        />
        <p className="mt-3 text-sm text-muted">{t('drawingCaption')}</p>
      </div>

      <dl className="mt-12 grid gap-6 border-y border-rule py-8 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label={t('client')} value={project.client} />
        <Fact label={t('location')} value={tx(project.location, loc)} />
        <Fact label={t('typology')} value={tx(project.typology, loc)} />
        {project.facts.map((fact) => (
          <Fact
            key={tx(fact.label, loc)}
            label={tx(fact.label, loc)}
            value={tx(fact.value, loc)}
          />
        ))}
      </dl>

      <section className="mt-12 grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="font-display text-3xl">{t('program')}</h2>
          <ul className="mt-5 space-y-4 text-base leading-relaxed text-muted">
            {project.program.map((item) => (
              <li key={tx(item, loc)} className="border-l border-rule pl-4">
                {tx(item, loc)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-3xl">{t('palette')}</h2>
          <p className="mt-2 text-sm text-muted">{t('paletteNote')}</p>
          <ul className="mt-5 space-y-3">
            {project.palette.map((swatch) => (
              <li key={swatch.hex} className="flex items-center gap-3">
                <span
                  className="h-8 w-8 border border-rule"
                  style={{ background: swatch.hex }}
                  aria-hidden
                />
                <span className="text-sm">
                  {tx(swatch.name, loc)}
                  <span className="ml-2 text-muted">{swatch.hex}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 border-t border-rule pt-12">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl">{t('related')}</h2>
          <Link href="/contact" className="label text-muted hover:text-charcoal">
            {t('brief')}
          </Link>
        </div>
        <div className="grid gap-12 md:grid-cols-3">
          {related.map((item) => (
            <ProjectCard key={item.slug} project={item} locale={loc} />
          ))}
        </div>
      </section>
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
