'use client';

import { cn } from '@/lib/utils';
import type { Category } from '@/types';
import type { Locale } from '@/types';
import { getLocalizedName } from '@/lib/utils';

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
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn('chip shrink-0', !selected && 'chip-active')}
      >
        {allLabel}
      </button>
      {categories.map((cat) => (
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
