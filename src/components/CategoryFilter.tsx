'use client';

import { cn, getLocalizedName } from '@/lib/utils';
import { getDisplayCategories } from '@/lib/category-display';
import type { Category } from '@/types';
import type { Locale } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
  locale: Locale;
  allLabel: string;
}

export function CategoryFilter({
  categories,
  selected,
  onSelect,
  locale,
  allLabel,
}: CategoryFilterProps) {
  const active = getDisplayCategories(categories);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn('chip shrink-0', !selected && 'chip-active')}
      >
        {allLabel}
      </button>
      {active.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.slug)}
          className={cn('chip shrink-0', selected === cat.slug && 'chip-active')}
        >
          {getLocalizedName(cat, locale)}
        </button>
      ))}
    </div>
  );
}
