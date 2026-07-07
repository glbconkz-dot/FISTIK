'use client';

import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { clearB2BProductPrice, setB2BProductPrice } from '@/app/actions/b2b-prices';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { getLocalizedProductName } from '@/lib/admin-messages';
import { getSemiFinishedPackLabel } from '@/lib/semi-finished-groups';
import { groupProductsByDisplayCategory } from '@/lib/category-display';
import { getLocalizedName } from '@/lib/utils';
import type { Category, Product } from '@/types';

interface B2BPriceListProps {
  products: Product[];
  categories: Category[];
  b2bPrices: Record<string, number>;
}

function b2bPriceInputMap(
  products: Product[],
  b2bPrices: Record<string, number>
): Record<string, string> {
  return Object.fromEntries(
    products.map((p) => {
      const b2b = b2bPrices[p.id];
      return [p.id, b2b != null ? String(Math.round(b2b)) : ''];
    })
  ) as Record<string, string>;
}

function parsePriceInput(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 0;
  return Math.min(9_999_999, Math.max(0, Number.parseInt(digits, 10)));
}

export function B2BPriceList({ products, categories, b2bPrices }: B2BPriceListProps) {
  const router = useRouter();
  const { locale, t } = useAdminLocale();
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>(() =>
    b2bPriceInputMap(products, b2bPrices)
  );
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setPriceInputs(b2bPriceInputMap(products, b2bPrices));
  }, [products, b2bPrices]);

  const handlePriceInputChange = (id: string, raw: string) => {
    if (raw === '') {
      setPriceInputs((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const digits = raw.replace(/\D/g, '').slice(0, 7);
    setPriceInputs((prev) => ({ ...prev, [id]: digits }));
  };

  const handleSave = (id: string, retailPrice: number) => {
    const raw = priceInputs[id] ?? '';
    const parsed = parsePriceInput(raw);

    startTransition(async () => {
      const result =
        raw.trim() === ''
          ? await clearB2BProductPrice(id)
          : await setB2BProductPrice(id, parsed);

      if (result.ok) {
        setError(null);
        setSavedId(id);
        if (raw.trim() === '') {
          setPriceInputs((prev) => ({ ...prev, [id]: '' }));
        } else {
          setPriceInputs((prev) => ({ ...prev, [id]: String(result.price) }));
        }
        router.refresh();
        setTimeout(() => setSavedId(null), 1500);
      } else {
        setError(result.error);
      }
    });
  };

  const grouped = groupProductsByDisplayCategory(products, categories);
  const groupedIds = new Set(grouped.flatMap((g) => g.products.map((p) => p.id)));
  const uncategorized = products.filter((p) => !groupedIds.has(p.id));

  const renderRow = (product: Product) => {
    const retail = Math.round(Number(product.price ?? 0));
    const hasB2b = b2bPrices[product.id] != null;
    const displayName = getLocalizedProductName(product, locale);
    const packLabel = getSemiFinishedPackLabel(product.slug, (key) => t(key as 'packLabel6'));

    return (
      <div
        key={product.id}
        className="luxury-card flex flex-wrap items-center gap-2.5 p-2.5 sm:gap-3 sm:p-3"
      >
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-border/30">
          {product.image_url ? (
            <Image src={product.image_url} alt={displayName} fill className="object-cover" sizes="40px" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-accent">F</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium sm:text-base">{displayName}</p>
          <p className="text-xs text-muted">
            {t('b2bRetailPrice')}: {retail.toLocaleString('ru-RU')} ₸
            {!hasB2b ? ` · ${t('b2bUsesRetail')}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={9999999}
              step={1}
              inputMode="numeric"
              disabled={isPending}
              value={priceInputs[product.id] ?? ''}
              placeholder={String(retail)}
              onChange={(e) => handlePriceInputChange(product.id, e.target.value)}
              onFocus={(e) => e.target.select()}
              onBlur={() => handleSave(product.id, retail)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
              }}
              className="price-input"
              aria-label={t('b2bPriceLabel')}
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleSave(product.id, retail)}
              className="btn-outline px-2.5 py-1.5 text-xs"
            >
              {savedId === product.id ? '✓' : t('save')}
            </button>
          </div>
          {packLabel ? (
            <span className="text-[11px] font-medium text-muted">{packLabel}</span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">{t('b2bPricesHint')}</p>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {grouped.map(({ category, products: categoryProducts }) => (
        <section key={category.id} className="space-y-2">
          <div className="sticky top-0 z-10 -mx-1 border-b border-border/80 bg-background/95 px-1 py-2 backdrop-blur-sm">
            <h2 className="font-display text-lg font-semibold">
              {getLocalizedName(category, locale)}
            </h2>
          </div>
          {categoryProducts.map(renderRow)}
        </section>
      ))}

      {uncategorized.length > 0 ? (
        <section className="space-y-2">
          <div className="sticky top-0 z-10 -mx-1 border-b border-border/80 bg-background/95 px-1 py-2 backdrop-blur-sm">
            <h2 className="font-display text-lg font-semibold">{t('uncategorized')}</h2>
          </div>
          {uncategorized.map(renderRow)}
        </section>
      ) : null}

      {products.length === 0 ? (
        <p className="py-8 text-center text-muted">{t('noProducts')}</p>
      ) : null}
    </div>
  );
}
