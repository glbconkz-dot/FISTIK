import { Link } from '@/i18n/routing';
import type { AppLocale } from '@/i18n/routing';
import { MassingDrawing } from '@/components/MassingDrawing';
import type { Project } from '@/lib/projects';
import { CATEGORIES } from '@/lib/projects';
import { tx } from '@/lib/studio';

type Props = {
  project: Project;
  locale: AppLocale;
};

export function ProjectCard({ project, locale }: Props) {
  const category = CATEGORIES.find((item) => item.id === project.category);

  return (
    <Link href={`/work/${project.slug}`} className="group block">
      <MassingDrawing
        kind={project.drawing}
        title={tx(project.title, locale)}
        className="aspect-[8/5]"
      />
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-rule pt-3">
        <div className="min-w-0">
          <p className="font-display text-2xl leading-tight group-hover:text-bronze">
            {tx(project.title, locale)}
          </p>
          <p className="mt-1 text-sm text-muted">{tx(project.location, locale)}</p>
        </div>
        <p className="label shrink-0 text-muted">{project.yearLabel}</p>
      </div>
      <p className="mt-2 label text-muted">
        {category ? tx(category.label, locale) : project.category}
        <span className="mx-2">/</span>
        {tx(project.typology, locale)}
      </p>
    </Link>
  );
}
