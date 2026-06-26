'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const HERO_LOGOS = [
  { src: '/logo.png', width: 72, height: 14 },
  { src: '/logo-square.png', width: 14, height: 14 },
] as const;

export function HeroBrandMark() {
  const [logo, setLogo] = useState<(typeof HERO_LOGOS)[number] | null>(null);

  useEffect(() => {
    const index = Math.floor(Math.random() * HERO_LOGOS.length);
    setLogo(HERO_LOGOS[index]);
  }, []);

  return (
    <div className="flex h-11 items-center justify-center">
      {logo ? (
        <Image
          src={logo.src}
          alt="Fistik"
          width={logo.width}
          height={logo.height}
          priority
          className="h-[14px] w-auto object-contain opacity-85"
        />
      ) : (
        <span className="font-display text-sm tracking-wide text-accent/50">fistik</span>
      )}
    </div>
  );
}
