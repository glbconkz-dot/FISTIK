'use client';

import { useMemo, useState, useTransition } from 'react';
import { saveStorefrontSection, verifyStorefrontSync } from '@/app/actions/admin-storefront';
import { getLocalizedProductName } from '@/lib/admin-messages';
import { groupProductsByDisplayCategory } from '@/lib/category-display';
import { STOREFRONT_SECTION_KEYS } from '@/lib/storefront-utils';
import { getLocalizedName } from '@/lib/utils';
import type { Category, Product, StorefrontSection, StorefrontSectionKey } from '@/types';

const SECTION_LABELS: Record<StorefrontSectionKey, { tr: string; hint: string }> = {
  todays_favorites: {
    tr: 'Günün Favorileri',
    hint: 'Ana sayfanın en üstündeki bölüm. Boş bırakılırsa otomatik liste kullanılır.',
  },
};

interface AdminStorefrontEditorProps {
  products: Product[];
  categories: Category[];
  sections: StorefrontSection[];
}

export function AdminStorefrontEditor({
  products,
  categories,
  sections,
}: AdminStorefrontEditorProps) {
  const initial = useMemo(() => {
    const map: Record<StorefrontSectionKey, string[]> = {
      todays_favorites: [],
    };
    for (const section of sections) {
      map[section.key] = section.product_slugs?.length
        ? section.product_slugs
        : section.product_ids
            .map((id) => products.find((p) => p.id === id)?.slug)
            .filter((s): s is string => Boolean(s));
    }
    return map;
  }, [sections, products]);

  const [selection, setSelection] = useState<Record<StorefrontSectionKey, string[]>>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeProducts = products.filter((p) => p.is_active);
  const slugToProduct = useMemo(
    () => new Map(activeProducts.map((p) => [p.slug, p])),
    [activeProducts]
  );

  const groupedProducts = useMemo(
    () => groupProductsByDisplayCategory(activeProducts, categories),
    [activeProducts, categories]
  );

  const groupedIds = useMemo(
    () => new Set(groupedProducts.flatMap((g) => g.products.map((p) => p.id))),
    [groupedProducts]
  );

  const uncategorized = useMemo(
    () => activeProducts.filter((p) => !groupedIds.has(p.id)),
    [activeProducts, groupedIds]
  );

  const toggleProduct = (key: StorefrontSectionKey, slug: string) => {
    setSelection((prev) => {
      const current = prev[key];
      if (current.includes(slug)) {
        return { ...prev, [key]: current.filter((s) => s !== slug) };
      }
      if (current.length >= 4) return prev;
      return { ...prev, [key]: [...current, slug] };
    });
  };

  const saveSection = (key: StorefrontSectionKey) => {
    setMessage(null);
    setError(null);
    const slugs = selection[key];
    const ids = slugs
      .map((slug) => slugToProduct.get(slug)?.id)
      .filter((id): id is string => Boolean(id));

    startTransition(async () => {
      const result = await saveStorefrontSection(key, ids, slugs);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(
        `${SECTION_LABELS[key].tr} kaydedildi (${result.slugCount} ürün). Canlı vitrin: ${result.liveSectionCount} bölüm yüklü.` +
          (result.storefrontError ? ` Uyarı: ${result.storefrontError}` : '')
      );
    });
  };

  const saveAll = () => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      for (const key of STOREFRONT_SECTION_KEYS) {
        const slugs = selection[key];
        const ids = slugs
          .map((slug) => slugToProduct.get(slug)?.id)
          .filter((id): id is string => Boolean(id));
        const result = await saveStorefrontSection(key, ids, slugs);
        if (!result.ok) {
          setError(`${SECTION_LABELS[key].tr}: ${result.error}`);
          return;
        }
      }
      const verify = await verifyStorefrontSync();
      setMessage(
        `Tüm bölümler kaydedildi. Site API: ${verify.sections.length} bölüm` +
          (verify.error ? ` — HATA: ${verify.error}` : ' — OK')
      );
    });
  };

  const checkLive = () => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const verify = await verifyStorefrontSync();
      if (verify.error) {
        setError(`Canlı okuma hatası: ${verify.error}`);
        return;
      }
      const configured = verify.sections.filter(
        (s) => (s.product_slugs?.length ?? 0) > 0 || (s.product_ids?.length ?? 0) > 0
      );
      setMessage(
        `Canlı bağlantı OK (${verify.source}). Yapılandırılmış ${configured.length} bölüm. Ana sayfayı yenileyin.`
      );
    });
  };

  const renderProductToggle = (key: StorefrontSectionKey, product: Product) => {
    const checked = selection[key].includes(product.slug);
    const disabled = !checked && selection[key].length >= 4;

    return (
      <button
        key={product.id}
        type="button"
        disabled={disabled}
        aria-pressed={checked}
        onClick={() => toggleProduct(key, product.slug)}
        className={`flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
          checked
            ? 'border-foreground bg-foreground text-surface'
            : disabled
              ? 'cursor-not-allowed border-border opacity-50'
              : 'border-border hover:bg-cream'
        }`}
      >
        <span className="line-clamp-2">{getLocalizedProductName(product, 'tr')}</span>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      <div className="luxury-card space-y-3 p-4 text-sm">
        <p>
          Seçimler <strong>Supabase → fistik.kz</strong> zinciriyle kaydedilir. Kayıttan sonra ana
          sayfa otomatik yenilenir.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" disabled={isPending} onClick={saveAll}>
            Tümünü kaydet
          </button>
          <button type="button" className="btn-outline" disabled={isPending} onClick={checkLive}>
            Canlı bağlantıyı test et
          </button>
          <a
            href="/api/catalog"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline inline-flex"
          >
            API kontrol (/api/catalog)
          </a>
        </div>
      </div>

      <div className="min-h-[3.25rem]" aria-live="polite">
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : message ? (
          <p className="rounded-xl bg-brand/25 px-4 py-3 text-sm text-foreground">{message}</p>
        ) : null}
      </div>

      {STOREFRONT_SECTION_KEYS.map((key) => (
        <section key={key} className="luxury-card p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">{SECTION_LABELS[key].tr}</h2>
              <p className="mt-1 text-sm text-muted">{SECTION_LABELS[key].hint}</p>
              <p className="mt-1 text-xs text-muted">Seçili: {selection[key].length}/4</p>
            </div>
            <button
              type="button"
              className="btn-primary shrink-0"
              disabled={isPending}
              onClick={() => saveSection(key)}
            >
              Kaydet
            </button>
          </div>

          <div
            className="h-[min(70vh,28rem)] overflow-y-auto overscroll-contain pr-1 sm:pr-2"
            style={{ overflowAnchor: 'none' }}
          >
            <div className="space-y-5">
              {groupedProducts.map(({ category, products: categoryProducts }) => (
                <div key={category.id}>
                  <h3 className="sticky top-0 z-10 border-b border-border bg-surface/95 py-2 font-display text-sm font-semibold backdrop-blur-sm">
                    {getLocalizedName(category, 'tr')}
                  </h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {categoryProducts.map((product) => renderProductToggle(key, product))}
                  </div>
                </div>
              ))}

              {uncategorized.length > 0 ? (
                <div>
                  <h3 className="sticky top-0 z-10 border-b border-border bg-surface/95 py-2 font-display text-sm font-semibold backdrop-blur-sm">
                    Kategorisiz
                  </h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {uncategorized.map((product) => renderProductToggle(key, product))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
