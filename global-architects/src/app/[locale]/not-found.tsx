import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <div className="py-24">
      <p className="label">{t('kicker')}</p>
      <h1 className="display mt-4 text-6xl italic">{t('title')}</h1>
      <p className="mt-4 max-w-md text-muted">{t('body')}</p>
      <Link href="/" className="mt-8 inline-block border-b border-charcoal pb-1 text-sm">
        {t('home')}
      </Link>
    </div>
  );
}
