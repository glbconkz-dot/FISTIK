'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteClearanceItem,
  saveClearanceItem,
  toggleClearanceActive,
} from '@/app/actions/admin-clearance';
import { getLocalizedProductName } from '@/lib/admin-messages';
import { groupProductsByDisplayCategory } from '@/lib/category-display';
import { formatClearanceTime } from '@/lib/b2c/clearance';
import { formatPrice, getLocalizedName } from '@/lib/utils';
import type { Category, ClearanceRule, Product } from '@/types';

const DISCOUNT_PRESETS = [25, 30];

interface AdminClearanceEditorProps {
  products: Product[];
  categories: Category[];
  clearanceRules: ClearanceRule[];
}

type Draft = {
  productSlug: string;
  discountPercent: number;
  startTime: string;
  endTime: string;
};

const defaultDraft = (): Draft => ({
  productSlug: '',
  discountPercent: 25,
  startTime: '16:00',
  endTime: '20:00',
});

export function AdminClearanceEditor({
  products,
  categories,
  clearanceRules,
}: AdminClearanceEditorProps) {
  const router = useRouter();
  const [rules, setRules] = useState(clearanceRules);

  useEffect(() => {
    setRules(clearanceRules);
  }, [clearanceRules]);
  const [draft, setDraft] = useState<Draft>(defaultDraft);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeProducts = useMemo(
    () => products.filter((p) => p.is_active && Number(p.stock_quantity ?? 0) > 0),
    [products]
  );

  const slugToProduct = useMemo(
    () => new Map(activeProducts.map((p) => [p.slug, p])),
    [activeProducts]
  );

  const usedSlugs = useMemo(() => new Set(rules.map((r) => r.product_slug)), [rules]);

  const groupedProducts = useMemo(
    () => groupProductsByDisplayCategory(activeProducts, categories),
    [activeProducts, categories]
  );

  const selectedProduct = draft.productSlug ? slugToProduct.get(draft.productSlug) : undefined;

  const addRule = () => {
    setMessage(null);
    setError(null);

    if (!selectedProduct) {
      setError('Stokta olan bir ürün seçin');
      return;
    }

    if (usedSlugs.has(selectedProduct.slug)) {
      setError('Bu ürün zaten listede — düzenlemek için kaydedin veya silin');
      return;
    }

    startTransition(async () => {
      const result = await saveClearanceItem({
        productSlug: selectedProduct.slug,
        productId: selectedProduct.id,
        discountPercent: draft.discountPercent,
        startTime: draft.startTime,
        endTime: draft.endTime,
        isActive: true,
        sortOrder: rules.length,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDraft(defaultDraft());
      setMessage('Acil satış kuralı eklendi');
      router.refresh();
    });
  };

  const updateRule = (rule: ClearanceRule, patch: Partial<ClearanceRule>) => {
    const product = slugToProduct.get(rule.product_slug);
    if (!product) return;

    setMessage(null);
    setError(null);

    const next = { ...rule, ...patch };

    startTransition(async () => {
      const result = await saveClearanceItem({
        productSlug: next.product_slug,
        productId: product.id,
        discountPercent: next.discount_percent,
        startTime: next.start_time,
        endTime: next.end_time,
        isActive: next.is_active,
        sortOrder: next.sort_order,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...next, updated_at: result.updatedAt } : r))
      );
      setMessage('Kaydedildi');
      router.refresh();
    });
  };

  const removeRule = (id: string) => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await deleteClearanceItem(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRules((prev) => prev.filter((r) => r.id !== id));
      setMessage('Silindi');
      router.refresh();
    });
  };

  const toggleActive = (rule: ClearanceRule) => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const nextActive = !rule.is_active;
      const result = await toggleClearanceActive(rule.id, nextActive);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRules((prev) =>
        prev.map((r) =>
          r.id === rule.id ? { ...r, is_active: nextActive, updated_at: result.updatedAt } : r
        )
      );
      router.refresh();
    });
  };

  return (
    <section className="mt-10 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold">Acil Satış / Gün Sonu İndirimi</h2>
        <p className="mt-1 text-sm text-muted">
          Stokta kalan ürünler için belirli saat aralığında otomatik indirim. Örnek: 16:00–23:59
          arası %25, yaş pasta 17:00–20:00 arası %30. Saatler Almatı (KZ) saatine göredir.
        </p>
      </div>

      {message ? <p className="mb-3 text-sm text-green-700">{message}</p> : null}
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <div className="rounded-xl border border-dashed border-border bg-cream/60 p-4">
        <h3 className="text-sm font-semibold">Yeni kural ekle</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">Ürün (stokta)</label>
            <select
              className="input-field w-full"
              value={draft.productSlug}
              onChange={(e) => setDraft((d) => ({ ...d, productSlug: e.target.value }))}
              disabled={isPending}
            >
              <option value="">Seçin…</option>
              {groupedProducts.map((group) => (
                <optgroup key={group.category.id} label={getLocalizedName(group.category, 'tr')}>
                  {group.products
                    .filter((p) => !usedSlugs.has(p.slug))
                    .map((p) => (
                      <option key={p.id} value={p.slug}>
                        {getLocalizedProductName(p, 'tr')} — {formatPrice(Number(p.price))} (
                        {p.stock_quantity} adet)
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">İndirim %</label>
            <div className="flex gap-1">
              {DISCOUNT_PRESETS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, discountPercent: pct }))}
                  className={`rounded-lg border px-2 py-2 text-sm font-semibold ${
                    draft.discountPercent === pct
                      ? 'border-brand bg-brand text-accent'
                      : 'border-border bg-white'
                  }`}
                >
                  %{pct}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={90}
                className="input-field w-16"
                value={draft.discountPercent}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, discountPercent: Number(e.target.value) || 25 }))
                }
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Başlangıç</label>
            <input
              type="time"
              className="input-field w-full"
              value={draft.startTime}
              onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Bitiş</label>
            <input
              type="time"
              className="input-field w-full"
              value={draft.endTime}
              onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
            />
          </div>
        </div>
        {selectedProduct ? (
          <p className="mt-2 text-xs text-muted">
            Önizleme: {getLocalizedName(selectedProduct, 'tr')}{' '}
            {formatPrice(Number(selectedProduct.price))} →{' '}
            {formatPrice(
              Math.round(Number(selectedProduct.price) * (1 - draft.discountPercent / 100))
            )}
          </p>
        ) : null}
        <button
          type="button"
          className="btn-primary mt-3"
          onClick={addRule}
          disabled={isPending || !draft.productSlug}
        >
          Listeye ekle
        </button>
      </div>

      {rules.length === 0 ? (
        <p className="mt-4 text-sm text-muted">Henüz acil satış kuralı yok.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rules.map((rule) => {
            const product = slugToProduct.get(rule.product_slug);
            const name = product
              ? getLocalizedProductName(product, 'tr')
              : rule.product_slug;

            return (
              <li
                key={rule.id}
                className={`rounded-xl border p-4 ${
                  rule.is_active ? 'border-border bg-white' : 'border-border/60 bg-muted/5 opacity-70'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted">
                      %{rule.discount_percent} · {formatClearanceTime(rule.start_time)} –{' '}
                      {formatClearanceTime(rule.end_time)}
                      {product ? ` · Stok: ${product.stock_quantity}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-outline text-xs"
                      onClick={() => toggleActive(rule)}
                      disabled={isPending}
                    >
                      {rule.is_active ? 'Pasif yap' : 'Aktif yap'}
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-600 underline"
                      onClick={() => removeRule(rule.id)}
                      disabled={isPending}
                    >
                      Sil
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-4">
                  <div>
                    <label className="text-xs text-muted">İndirim %</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      className="input-field mt-0.5 w-full"
                      defaultValue={rule.discount_percent}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (v !== rule.discount_percent && v >= 1 && v <= 90) {
                          updateRule(rule, { discount_percent: v });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted">Başlangıç</label>
                    <input
                      type="time"
                      className="input-field mt-0.5 w-full"
                      defaultValue={formatClearanceTime(rule.start_time)}
                      onBlur={(e) => {
                        if (e.target.value && e.target.value !== formatClearanceTime(rule.start_time)) {
                          updateRule(rule, { start_time: e.target.value });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted">Bitiş</label>
                    <input
                      type="time"
                      className="input-field mt-0.5 w-full"
                      defaultValue={formatClearanceTime(rule.end_time)}
                      onBlur={(e) => {
                        if (e.target.value && e.target.value !== formatClearanceTime(rule.end_time)) {
                          updateRule(rule, { end_time: e.target.value });
                        }
                      }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
