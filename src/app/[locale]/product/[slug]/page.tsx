import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  getCatalogData,
  getCategoryFilterSlug,
  getCategoryName,
  getProductBySlug,
} from '@/lib/catalog';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import type { Locale } from '@/types';
import { getTranslations } from 'next-intl/server';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('product');

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const { categories } = await getCatalogData();
  const categoryName = getCategoryName(product, categories, locale as Locale);
  const categorySlug = getCategoryFilterSlug(product, categories);

  const backHref = categorySlug
    ? { pathname: '/menu' as const, query: { cat: categorySlug } }
    : ('/menu' as const);

  return (
    <div>
      <Link href={backHref} className="mb-4 inline-block text-sm text-muted hover:text-foreground">
        ← {categoryName ? t('backToCategory', { category: categoryName }) : t('back')}
      </Link>
      <ProductDetailClient
        product={product}
        categoryName={categoryName}
        locale={locale as Locale}
      />
    </div>
  );
}
