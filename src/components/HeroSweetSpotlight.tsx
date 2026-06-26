'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { HERO_SWEETS, pickRandomHeroSweet } from '@/lib/hero-sweets';

export function HeroSweetSpotlight() {
  const [sweet, setSweet] = useState<(typeof HERO_SWEETS)[number] | null>(null);

  useEffect(() => {
    setSweet(pickRandomHeroSweet());
  }, []);

  return (
    <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-3xl border border-border/60 bg-surface luxury-shadow sm:h-48 sm:w-48">
      {sweet ? (
        <Image
          src={sweet.src}
          alt={sweet.alt}
          fill
          priority
          sizes="(max-width: 640px) 176px, 192px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-brand/30">
          <span className="font-display text-4xl text-accent/40">F</span>
        </div>
      )}
    </div>
  );
}
