'use client';

import { useMemo, useState, useTransition } from 'react';
import { saveStorefrontSection } from '@/app/actions/admin-storefront';
import { getLocalizedProductName } from '@/lib/admin-messages';
import { STOREFRONT_SECTION_KEYS } from '@/lib/storefront-utils';
import type { Product, StorefrontSection, StorefrontSectionKey } from '@/types';

const SECTION_LABELS: Record<StorefrontSectionKey, { tr: string; hint: string }> = {
  todays_favorites: {
    tr: 'Günün Favorileri',
    hint: 'Ana sayfanın en üstündeki bölüm. Boş bırakılırsa stokta olan ilk 4 ürün gösterilir.',
  },
  new_collection: {
    tr: 'Yeni Koleksiyon',
    hint: 'Admin seçimi yoksa en yeni eklenen 4 ürün gösterilir (created_at).',
  },
  most_ordered: {
    tr: 'En Çok Sipariş Edilen',
    hint: 'Admin seçimi yoksa stokta olan ve sırası en düşük 4 ürün gösterilir.',
  },
  chefs_selection: {
    tr: 'Şefin Seçimi',
    hint: 'Admin seçimi yoksa her kategoriden bir ürün (max 4) gösterilir.',
  },
};

interface AdminStorefrontEditorProps {
  products: Product[];
  sections: StorefrontSection[];
}

export function AdminStorefrontEditor({ products, sections }: AdminStorefrontEditorProps) {
  const initial = useMemo(() => {
    const map: Record<StorefrontSectionKey, string[]> = {
      todays_favorites: [],
      new_collection: [],
      most_ordered: [],
      chefs_selection: [],
    };
    for (const section of sections) {
      map[section.key] = section.product_ids ?? [];
    }
    return map;
  }, [sections]);

  const [selection, setSelection] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeProducts = products.filter((p) => p.is_active);

  const toggleProduct = (key: StorefrontSectionKey, productId: string) => {
    setSelection((prev) => {
      const current = prev[key];
      if (current.includes(productId)) {
        return { ...prev, [key]: current.filter((id) => id !== productId) };
      }
      if (current.length >= 4) {
        return prev;
      }
      return { ...prev, [key]: [...current, productId] };
    });
  };

  const handleSave = (key: StorefrontSectionKey) => {
    setMessage(null);
    startTransition(async () => {
      const result = await saveStorefrontSection(key, selection[key]);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setMessage(`${SECTION_LABELS[key].tr} kaydedildi.`);
    });
  };

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        Ana sayfadaki vitrin bölümlerinde hangi ürünlerin görüneceğini seçin (en fazla 4).
        Seçim yapmazsanız site otomatik listeler kullanır.
      </p>

      {message ? <p className="rounded-xl bg-brand/25 px-4 py-3 text-sm">{message}</p> : null}

      {STOREFRONT_SECTION_KEYS.map((key) => (
        <section key={key} className="luxury-card p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">{SECTION_LABELS[key].tr}</h2>
              <p className="mt-1 text-sm text-muted">{SECTION_LABELS[key].hint}</p>
              <p className="mt-1 text-xs text-muted">
                Seçili: {selection[key].length}/4
              </p>
            </div>
            <button
              type="button"
              className="btn-primary shrink-0"
              disabled={isPending}
              onClick={() => handleSave(key)}
            >
              Kaydet
            </button>
          </div>

          <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
            {activeProducts.map((product) => {
              const checked = selection[key].includes(product.id);
              const disabled = !checked && selection[key].length >= 4;

              return (
                <label
                  key={product.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    checked
                      ? 'border-foreground bg-foreground text-surface'
                      : disabled
                        ? 'border-border opacity-50'
                        : 'border-border hover:bg-cream'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleProduct(key, product.id)}
                  />
                  <span className="line-clamp-2">
                    {getLocalizedProductName(product, 'tr')}
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
