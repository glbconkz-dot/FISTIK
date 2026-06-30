'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useIsClient } from '@/hooks/use-is-client';
import { cn } from '@/lib/utils';
import { useFavoritesStore } from '@/stores/favorites';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function FavoriteButton({ productId, className, size = 'md' }: FavoriteButtonProps) {
  const t = useTranslations('favorites');
  const isClient = useIsClient();
  const isFavorite = useFavoritesStore((s) => s.isFavorite(productId));
  const toggle = useFavoritesStore((s) => s.toggle);

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const btnSize = size === 'sm' ? 'h-9 w-9' : 'h-10 w-10';

  return (
    <button
      type="button"
      aria-label={isFavorite ? t('remove') : t('add')}
      aria-pressed={isClient ? isFavorite : false}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={cn(
        'flex items-center justify-center rounded-full border border-border/70 bg-surface/90 backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95',
        btnSize,
        isClient && isFavorite && 'border-foreground/20 bg-foreground text-surface',
        className
      )}
    >
      <Heart
        className={cn(iconSize, isClient && isFavorite && 'fill-current')}
        strokeWidth={1.75}
      />
    </button>
  );
}
