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

const SWIPE_MIN = 48;

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
  const touchDeltaX = useRef(0);
  const didSwipe = useRef(false);
  const safeIndex = Math.min(index, Math.max(images.length - 1, 0));
  const current = images[safeIndex] ?? '';
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
    touchDeltaX.current = 0;
    didSwipe.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const x = e.changedTouches[0]?.clientX ?? touchStartX.current;
    touchDeltaX.current = x - touchStartX.current;
    if (Math.abs(touchDeltaX.current) > 12) {
      didSwipe.current = true;
    }
  };

  const onTouchEnd = () => {
    if (touchStartX.current == null) return;
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    if (!multi || Math.abs(delta) < SWIPE_MIN) return;
    go(safeIndex + (delta < 0 ? 1 : -1));
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') go(safeIndex - 1);
      if (e.key === 'ArrowRight') go(safeIndex + 1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox, go, safeIndex]);

  const aspect =
    variant === 'detail'
      ? 'aspect-[3/4] w-full max-w-lg md:max-w-xl md:rounded-2xl'
      : 'aspect-[3/4]';

  const openLightbox = () => {
    if (didSwipe.current || !current) return;
    setLightbox(true);
  };

  const navBtn =
    'absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl text-white touch-manipulation active:bg-black/70 sm:h-10 sm:w-10';

  return (
    <>
      <div className={cn('mx-auto w-full', variant === 'detail' && 'max-w-lg md:max-w-xl')}>
        <div
          className={cn(
            'relative w-full overflow-hidden touch-pan-y',
            aspect,
            imageClasses.container,
            className
          )}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
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
                priority={priority && safeIndex === 0}
                className={cn(
                  variant === 'card' ? imageClasses.imageCard : imageClasses.image,
                  'pointer-events-none'
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

          {topLeft ? <div className="pointer-events-auto absolute left-2 top-2 z-30">{topLeft}</div> : null}
          {topRight ? (
            <div className="pointer-events-auto absolute right-2 top-2 z-30 sm:right-4 sm:top-4">
              {topRight}
            </div>
          ) : null}
          {overlay}

          {multi ? (
            <>
              <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2">
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
                      'pointer-events-auto h-3 min-h-[12px] rounded-full transition-all touch-manipulation',
                      i === safeIndex ? 'w-6 bg-white shadow-sm' : 'w-3 bg-white/75'
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label={t('galleryPrev')}
                className={cn(navBtn, 'left-2')}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  go(safeIndex - 1);
                }}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={t('galleryNext')}
                className={cn(navBtn, 'right-2')}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  go(safeIndex + 1);
                }}
              >
                ›
              </button>
            </>
          ) : null}
        </div>

        {multi && variant === 'detail' ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 touch-manipulation',
                  i === safeIndex ? 'border-accent' : 'border-border opacity-80'
                )}
                aria-label={t('galleryDot', { n: i + 1 })}
              >
                <Image src={url} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
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
            className="absolute right-3 top-3 z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl text-white touch-manipulation"
            aria-label={t('galleryClose')}
            onClick={() => setLightbox(false)}
          >
            ×
          </button>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center p-4 pt-16 touch-pan-y"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative h-full max-h-[min(80vh,900px)] w-full max-w-3xl">
              <Image
                key={`lb-${current}`}
                src={current}
                alt={alt}
                fill
                className="object-contain pointer-events-none"
                sizes="100vw"
                priority
              />
            </div>

            {multi ? (
              <>
                <button
                  type="button"
                  aria-label={t('galleryPrev')}
                  className="absolute left-2 top-1/2 z-[110] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-3xl text-white touch-manipulation sm:left-4"
                  onClick={() => go(safeIndex - 1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label={t('galleryNext')}
                  className="absolute right-2 top-1/2 z-[110] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-3xl text-white touch-manipulation sm:right-4"
                  onClick={() => go(safeIndex + 1)}
                >
                  ›
                </button>
              </>
            ) : null}
          </div>

          {multi ? (
            <div className="flex justify-center gap-2.5 pb-8 pt-2">
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
                    'h-3 rounded-full transition-all touch-manipulation',
                    i === safeIndex ? 'w-7 bg-white' : 'w-3 bg-white/50'
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
