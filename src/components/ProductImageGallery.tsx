'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { getProductImageClasses } from '@/lib/product-image';
import { getProductGallery } from '@/lib/product-gallery';
import type { Product } from '@/types';

interface ProductImageGalleryProps {
  product: Product;
  alt: string;
  /** detail = product page; card = menu/B2B cards */
  variant?: 'detail' | 'card';
  priority?: boolean;
  className?: string;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  overlay?: ReactNode;
}

export function ProductImageGallery({
  product,
  alt,
  variant = 'detail',
  priority = false,
  className,
  topLeft,
  topRight,
  overlay,
}: ProductImageGalleryProps) {
  const t = useTranslations('product');
  const images = getProductGallery(product);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const imageClasses = getProductImageClasses(product.slug, images[0] ?? product.image_url);
  const current = images[Math.min(index, Math.max(images.length - 1, 0))] ?? '';
  const multi = images.length > 1;

  const go = useCallback(
    (next: number) => {
      if (!multi) return;
      const len = images.length;
      setIndex(((next % len) + len) % len);
    },
    [images.length, multi]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    go(index + (delta < 0 ? 1 : -1));
  };

  const aspect =
    variant === 'detail'
      ? 'aspect-square w-full md:aspect-[4/3] md:rounded-2xl'
      : 'aspect-[4/5]';

  return (
    <div
      className={cn('relative overflow-hidden', aspect, imageClasses.container, className)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {current ? (
        <div className={imageClasses.frame}>
          <Image
            key={current}
            src={current}
            alt={alt}
            fill
            priority={priority}
            className={cn(
              variant === 'card' ? imageClasses.imageCard : imageClasses.image,
              variant === 'card' && 'transition-transform duration-500 group-hover:scale-105'
            )}
            sizes={variant === 'detail' ? '100vw' : '(max-width: 768px) 50vw, 25vw'}
            draggable={false}
          />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center font-display text-5xl text-accent/40">
          F
        </div>
      )}

      {topLeft ? <div className="absolute left-2 top-2 z-10">{topLeft}</div> : null}
      {topRight ? <div className="absolute right-2 top-2 z-10 sm:right-4 sm:top-4">{topRight}</div> : null}
      {overlay}

      {multi ? (
        <>
          <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={t('galleryDot', { n: i + 1 })}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIndex(i);
                }}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/55'
                )}
              />
            ))}
          </div>
          {variant === 'detail' ? (
            <>
              <button
                type="button"
                aria-label={t('galleryPrev')}
                className="absolute left-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white sm:flex"
                onClick={() => go(index - 1)}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={t('galleryNext')}
                className="absolute right-2 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white sm:flex"
                onClick={() => go(index + 1)}
              >
                ›
              </button>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
