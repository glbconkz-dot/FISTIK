'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useIsClient } from '@/hooks/use-is-client';
import { getEffectivePrice } from '@/lib/b2c/clearance';
import { cn, formatPrice, getLocalizedDescription, getLocalizedName } from '@/lib/utils';
import { useCartStore } from '@/stores/cart';
import type { Locale, Product } from '@/types';

interface CoffeeProductCardProps {
  product: Product;
  locale: Locale;
}

function descLines(raw: string): string[] {
  const cleaned = raw
    .replace(/^Fıstık Signature\s*[—–-]\s*/i, '')
    .replace(/^Çikolata Serisi\s*[—–-]\s*/i, '')
    .replace(/^Шоколадн[аа]я серия\s*[—–-]\s*/i, '')
    .replace(/^Шоколад сериясы\s*[—–-]\s*/i, '')
    .trim();
  if (!cleaned) return [];
  return cleaned
    .split(/[.;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);
}

/** Referans menü satırı: görsel | isim+özet | fiyat — görsele tıklayınca büyüt */
export function CoffeeProductCard({ product, locale }: CoffeeProductCardProps) {
  const t = useTranslations('catalog');
  const tCoffee = useTranslations('coffee');
  const isClient = useIsClient();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartQty = useCartStore(
    (s) => s.items.find((i) => i.productId === product.id)?.quantity ?? 0
  );

  const stock = Number(product.stock_quantity ?? 0);
  const outOfStock = stock <= 0;
  const inCart = isClient && cartQty > 0;
  const remaining = Math.max(0, stock - (isClient ? cartQty : 0));
  const atMax = remaining <= 0;
  const name = getLocalizedName(product, locale);
  const lines = descLines(getLocalizedDescription(product, locale));
  const src = product.image_url?.trim() ?? '';
  const price = getEffectivePrice(product);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxOpen]);

  const handleAdd = () => {
    if (!isClient || outOfStock || atMax) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name,
        price,
        image: product.image_url,
        stockMax: stock,
      },
      1
    );
  };

  return (
    <>
      <article
        className={cn(
          'flex items-center gap-2.5 border-b border-border/70 py-3 last:border-b-0 sm:gap-3',
          outOfStock && 'opacity-50',
          inCart && 'bg-pistachio-soft/40'
        )}
      >
        {src ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-cream ring-1 ring-border transition-opacity hover:opacity-90 sm:h-16 sm:w-16"
            aria-label={name}
          >
            <Image
              src={src}
              alt={name}
              fill
              sizes="64px"
              className="object-cover object-center"
              loading="lazy"
            />
          </button>
        ) : (
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream font-display text-base text-accent/35 ring-1 ring-border sm:h-16 sm:w-16">
            F
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[13px] font-bold uppercase tracking-wide text-foreground sm:text-sm">
            {name}
          </h2>
          {lines.length > 0 ? (
            <ul className="mt-0.5 space-y-0 text-[11px] leading-snug text-muted">
              {lines.map((line) => (
                <li key={line} className="truncate">
                  - {line}
                </li>
              ))}
            </ul>
          ) : null}
          {outOfStock ? (
            <p className="mt-0.5 text-[11px] font-medium text-muted">{t('soldOut')}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1 self-center">
          <p className="text-base font-bold tabular-nums leading-none text-foreground sm:text-lg">
            {formatPrice(price)}
          </p>
          {!outOfStock ? (
            <div className="flex items-center gap-1">
              {inCart ? (
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, cartQty - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-sm font-semibold text-muted"
                  aria-label="−"
                >
                  −
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleAdd}
                disabled={!isClient || atMax}
                className={cn(
                  'min-h-7 rounded-md px-2 text-[11px] font-semibold touch-manipulation disabled:opacity-50',
                  inCart ? 'bg-brand text-accent' : 'bg-foreground text-background'
                )}
              >
                {inCart ? `×${cartQty}` : tCoffee('add')}
              </button>
            </div>
          ) : null}
        </div>
      </article>

      {lightboxOpen && src ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={name}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 z-[101] flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl font-semibold text-white backdrop-blur-sm hover:bg-white/25"
            aria-label="Close"
          >
            ×
          </button>
          <div
            className="relative max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl bg-black shadow-2xl sm:max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={src}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, 512px"
                className="object-contain"
                priority
              />
            </div>
            <div className="border-t border-white/10 px-4 py-3 text-center">
              <p className="font-display text-base font-semibold text-white">{name}</p>
              <p className="mt-0.5 text-sm tabular-nums text-white/80">{formatPrice(price)}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
