'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { getProductGallery } from '@/lib/product-gallery';
import { getProductImageClasses } from '@/lib/product-image';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardImageProps {
  product: Product;
  alt: string;
  priority?: boolean;
  topLeft?: ReactNode;
  topRight?: ReactNode;
  overlay?: ReactNode;
}

/** Menü kartları — tek görsel, galeri/lightbox yok (hafif) */
export function ProductCardImage({
  product,
  alt,
  priority = false,
  topLeft,
  topRight,
  overlay,
}: ProductCardImageProps) {
  const images = getProductGallery(product);
  const src = images[0] ?? '';
  const imageClasses = getProductImageClasses(product.slug, src || product.image_url);

  return (
    <div
      className={cn(
        'relative mx-auto aspect-[3/4] w-full overflow-hidden',
        imageClasses.container
      )}
    >
      {src ? (
        <div className={imageClasses.frame}>
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
      )}

      {topLeft ? <div className="absolute left-2 top-2 z-10">{topLeft}</div> : null}
      {topRight ? (
        <div className="absolute right-2 top-2 z-10 sm:right-4 sm:top-4">{topRight}</div>
      ) : null}
      {overlay}
    </div>
  );
}
