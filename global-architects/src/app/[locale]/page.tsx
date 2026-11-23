import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { AppLocale } from '@/i18n/routing';
import { MassingDrawing } from '@/components/MassingDrawing';
import { ProjectCard } from '@/components/ProjectCard';
import { getFeaturedProjects } from '@/lib/projects';
import { STUDIO } from '@/lib/studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('homeTitle'), description: t('homeDescription') };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const featured = getFeaturedProjects();

  return (
    <div className="pb-20">
      <section className="border-b border-rule py-16 sm:py-24">
        <p className="label">{t('kicker')}</p>
        <h1 className="display mt-6 max-w-5xl text-[clamp(3.2rem,9vw,7.2rem)] italic">
          {t('headline')}
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {t('standfirst')}
        </p>
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-rule pt-6">
          <Stat value={`${STUDIO.years}+`} label={t('statYears')} />
          <Stat value={`${STUDIO.specialists}+`} label={t('statPeople')} />
          <Stat value={`${STUDIO.activeProjects}`} label={t('statActive')} />
          <Stat value={`${STUDIO.completedProjects}+`} label={t('statDone')} />
          <Stat value={`${STUDIO.licenseCategory}`} label={t('statLicense')} />
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="label">{t('drawingLabel')}</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">{t('drawingTitle')}</h2>
          </div>
          <p className="hidden max-w-sm text-right text-sm text-muted sm:block">{t('drawingNote')}</p>
        </div>
        <MassingDrawing kind="warehouse-campus" title={t('drawingTitle')} className="aspect-[16/9]" />
        <p className="mt-3 text-sm text-muted sm:hidden">{t('drawingNote')}</p>
      </section>

      <section className="border-t border-rule py-12 sm:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-4xl sm:text-5xl">{t('selected')}</h2>
          <Link href="/work" className="label text-muted hover:text-charcoal">
            {t('allWork')}
          </Link>
        </div>
        <div className="grid gap-12 md:grid-cols-2">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale as AppLocale} />
          ))}
        </div>
      </section>

      <section className="grid gap-10 border-t border-rule py-12 sm:py-16 md:grid-cols-2">
        <div>
          <p className="label">{t('practiceKicker')}</p>
          <h2 className="mt-3 font-display text-4xl leading-none">{t('practiceTitle')}</h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">{t('practiceBody')}</p>
          <Link href="/practice" className="mt-6 inline-block border-b border-charcoal pb-1 text-sm tracking-wide">
            {t('practiceCta')}
          </Link>
        </div>
        <div className="border border-rule p-6 sm:p-8">
          <p className="label">{STUDIO.constructionName}</p>
          <p className="mt-4 font-display text-3xl leading-tight">{t('constructionTitle')}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{t('constructionBody')}</p>
          <Link href="/services" className="mt-6 inline-block text-sm tracking-wide text-muted hover:text-charcoal">
            {t('servicesCta')}
          </Link>
        </div>
      </section>

      <section className="border-t border-rule py-12 sm:py-16">
        <p className="label">{t('briefKicker')}</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl leading-none sm:text-5xl">{t('briefTitle')}</h2>
        <Link
          href="/contact"
          className="mt-8 inline-block bg-charcoal px-6 py-3 text-sm tracking-[0.16em] text-paper uppercase"
        >
          {t('briefCta')}
        </Link>
      </section>

      <section className="border-t border-rule py-12 sm:py-16">
        <p className="label">{t('osKicker')}</p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl leading-none sm:text-5xl">{t('osTitle')}</h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">{t('osBody')}</p>
        <Link href="/projects" className="mt-8 inline-block border-b border-charcoal pb-1 text-sm tracking-wide">
          {t('osCta')}
        </Link>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl leading-none sm:text-4xl">{value}</p>
      <p className="mt-2 label">{label}</p>
    </div>
  );
}
