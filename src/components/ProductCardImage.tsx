'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { getProductGallery } from '@/lib/product-gallery';
import { getProductImageClasses } from '@/lib/product-image';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardImageProps {
  product: Product;
  alt: string;
  /** Same destination as product name — opens detail / gallery */
  href?: `/product/${string}`;
  priority?: boolean;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  overlay?: ReactNode;
}

/** Menü kartları — tek görsel; href verilirse isimle aynı ürün sayfasına gider */
export function ProductCardImage({
  product,
  alt,
  href,
  priority = false,
  topLeft,
  topRight,
  overlay,
}: ProductCardImageProps) {
  const images = getProductGallery(product);
  const src = images[0] ?? '';
  const imageClasses = getProductImageClasses(product.slug, src || product.image_url);

  const media = src ? (
    <div className={cn('relative h-full w-full', imageClasses.frame)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        className={cn(imageClasses.imageCard, 'object-center')}
        sizes="(max-width: 768px) 50vw, 25vw"
        draggable={false}
      />
    </div>
  ) : (
    <div className="flex h-full items-center justify-center font-display text-5xl text-accent/40">
      F
    </div>
  );

  return (
    <div
      className={cn(
        'relative mx-auto aspect-[3/4] w-full overflow-hidden',
        imageClasses.container
      )}
    >
      {href ? (
        <Link href={href} className="relative block h-full w-full" aria-label={alt}>
          {media}
        </Link>
      ) : (
        media
      )}

      {topLeft ? <div className="absolute left-2 top-2 z-10">{topLeft}</div> : null}
      {topRight ? (
        <div className="absolute right-2 top-2 z-10 sm:right-4 sm:top-4">{topRight}</div>
      ) : null}
      {overlay}
    </div>
  );
}
