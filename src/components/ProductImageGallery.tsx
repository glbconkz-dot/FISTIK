'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
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
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const current = images[Math.min(index, Math.max(images.length - 1, 0))] ?? '';
  const imageClasses = getProductImageClasses(product.slug, current || product.image_url);
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

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') go(index - 1);
      if (e.key === 'ArrowRight') go(index + 1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox, go, index]);

  const aspect =
    variant === 'detail'
      ? 'aspect-[3/4] w-full max-w-lg md:max-w-xl md:rounded-2xl'
      : 'aspect-[3/4]';

  const openLightbox = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!current) return;
    setLightbox(true);
  };

  return (
    <>
      <div
        className={cn('relative mx-auto w-full overflow-hidden', aspect, imageClasses.container, className)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {current ? (
          <button
            type="button"
            className={cn(imageClasses.frame, 'cursor-zoom-in border-0 bg-transparent p-0')}
            onClick={openLightbox}
            aria-label={t('galleryOpen')}
          >
            <Image
              key={current}
              src={current}
              alt={alt}
              fill
              priority={priority && index === 0}
              className={cn(
                variant === 'card' ? imageClasses.imageCard : imageClasses.image,
                'object-center'
              )}
              sizes={
                variant === 'detail'
                  ? '(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px'
                  : '(max-width: 768px) 50vw, 25vw'
              }
              draggable={false}
            />
          </button>
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
                    'h-2.5 min-w-[10px] rounded-full transition-all',
                    i === index ? 'w-5 bg-white shadow-sm' : 'w-2.5 bg-white/70'
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label={t('galleryPrev')}
              className="absolute left-1.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-lg text-white sm:left-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                go(index - 1);
              }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={t('galleryNext')}
              className="absolute right-1.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-lg text-white sm:right-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                go(index + 1);
              }}
            >
              ›
            </button>
          </>
        ) : null}
      </div>

      {lightbox && current ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="absolute right-3 top-3 z-[110] flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white"
            aria-label={t('galleryClose')}
            onClick={() => setLightbox(false)}
          >
            ×
          </button>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center p-4 pt-14"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative h-full max-h-[min(85vh,900px)] w-full max-w-3xl">
              <Image
                key={`lb-${current}`}
                src={current}
                alt={alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {multi ? (
              <>
                <button
                  type="button"
                  aria-label={t('galleryPrev')}
                  className="absolute left-2 top-1/2 z-[110] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-2xl text-white sm:left-4"
                  onClick={() => go(index - 1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label={t('galleryNext')}
                  className="absolute right-2 top-1/2 z-[110] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-2xl text-white sm:right-4"
                  onClick={() => go(index + 1)}
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          {multi ? (
            <div className="flex justify-center gap-2 pb-6 pt-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={t('galleryDot', { n: i + 1 })}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  className={cn(
                    'h-2.5 rounded-full transition-all',
                    i === index ? 'w-6 bg-white' : 'w-2.5 bg-white/50'
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
