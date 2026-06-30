'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { HERO_CAROUSEL_SLIDES } from '@/lib/hero-sweets';
import type { Locale } from '@/types';

const INTERVAL_MS = 4500;

interface HeroCarouselProps {
  locale: Locale;
}

export function HeroCarousel({ locale }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const slides = HERO_CAROUSEL_SLIDES;

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const active = slides[index] ?? slides[0];

  return (
    <div className="relative mx-auto w-full overflow-hidden rounded-3xl border border-border/60 bg-surface luxury-shadow">
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.src}
              alt={slide.captions[locale]}
              fill
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 1152px"
              className="object-cover"
            />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent px-4 pb-4 pt-16 sm:px-6 sm:pb-5">
          <p className="font-display text-lg font-semibold text-white sm:text-2xl">
            {active.captions[locale]}
          </p>
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="absolute bottom-3 right-3 flex gap-1.5 sm:bottom-4 sm:right-4">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
