'use client';

import Image from 'next/image';
import { useRouter } from '@/i18n/routing';
import { Reveal } from '@/components/ui/Reveal';
import { coverImageForDisplayCategory, getDisplayCategories } from '@/lib/category-display';
import { getLocalizedName } from '@/lib/utils';
import type { Category, Locale, Product } from '@/types';

interface CategoryShowcaseProps {
  categories: Category[];
  products: Product[];
  locale: Locale;
  title: string;
}

export function CategoryShowcase({ categories, products, locale, title }: CategoryShowcaseProps) {
  const router = useRouter();
  const active = getDisplayCategories(categories);

  if (active.length === 0) return null;

  const openCategory = (slug: string) => {
    router.push({ pathname: '/menu', query: { cat: slug } });
    window.setTimeout(() => {
      document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  return (
    <Reveal className="mb-14">
      <h2 className="section-title mb-5">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {active.map((cat, i) => {
          const cover = coverImageForDisplayCategory(cat, products, categories);
          const name = getLocalizedName(cat, locale);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => openCategory(cat.slug)}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-cream text-left luxury-shadow transition-transform duration-300 hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {cover ? (
                <Image
                  src={cover}
                  alt={name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand/30 to-cream" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <span className="absolute bottom-0 left-0 right-0 p-4 font-display text-lg font-semibold text-white">
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </Reveal>
  );
}
