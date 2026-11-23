import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { AppLocale } from '@/i18n/routing';
import { ProjectCard } from '@/components/ProjectCard';
import {
  CATEGORIES,
  getProjectsByCategory,
  isProjectCategory,
} from '@/lib/projects';
import { tx } from '@/lib/studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'work' });
  return { title: t('title'), description: t('description') };
}

export default async function WorkPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  const { type } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('work');
  const loc = locale as AppLocale;
  const active = isProjectCategory(type) ? type : 'all';
  const projects = getProjectsByCategory(active);

  return (
    <div className="pb-20 pt-12 sm:pt-16">
      <p className="label">{t('kicker')}</p>
      <h1 className="display mt-4 text-[clamp(2.8rem,7vw,5.5rem)] italic">{t('heading')}</h1>
      <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">{t('intro')}</p>
      <p className="mt-3 text-sm text-muted">{t('visualNote')}</p>

      <div className="mt-10 flex flex-wrap gap-x-5 gap-y-3 border-y border-rule py-4">
        {CATEGORIES.map((category) => {
          const href =
            category.id === 'all'
              ? '/work'
              : { pathname: '/work' as const, query: { type: category.id } };
          const isActive = active === category.id;
          return (
            <Link
              key={category.id}
              href={href}
              className={`label ${isActive ? 'text-charcoal' : 'text-muted hover:text-charcoal'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {tx(category.label, loc)}
            </Link>
          );
        })}
      </div>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} locale={loc} />
        ))}
      </div>
    </div>
  );
}
