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
import { formatClearanceTime, isClearanceWindowActive } from '@/lib/b2c/clearance';
import { formatPrice, getLocalizedName } from '@/lib/utils';
import { TimeInput24 } from '@/components/admin/TimeInput24';
import { STORE_TIMEZONE } from '@/lib/order-dates';
import type { Category, ClearanceRule, Product } from '@/types';

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

function clampDiscount(value: number): number {
  if (!Number.isFinite(value)) return 25;
  return Math.min(90, Math.max(1, Math.round(value)));
}

function RuleTimeField({
  initial,
  label,
  disabled,
  onCommit,
}: {
  initial: string;
  label: string;
  disabled?: boolean;
  onCommit: (value: string) => void;
}) {
  const [value, setValue] = useState(formatClearanceTime(initial));

  useEffect(() => {
    setValue(formatClearanceTime(initial));
  }, [initial]);

  return (
    <div>
      <label className="text-xs text-muted">{label}</label>
      <TimeInput24
        className="mt-0.5 w-full"
        value={value}
        onChange={setValue}
        onBlurCommit={(next) => {
          if (next !== formatClearanceTime(initial)) onCommit(next);
        }}
        disabled={disabled}
      />
    </div>
  );
}

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

    const discountPercent = clampDiscount(draft.discountPercent);

    startTransition(async () => {
      const result = await saveClearanceItem({
        productSlug: selectedProduct.slug,
        productId: selectedProduct.id,
        discountPercent,
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
      setMessage('Gün sonu indirimi eklendi');
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
        discountPercent: clampDiscount(next.discount_percent),
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
        <h2 className="font-display text-xl font-bold">Gün Sonu İndirimi</h2>
        <p className="mt-1 text-sm text-muted">
          Stokta kalan ürünler için belirli saat aralığında otomatik indirim. Örnek: 16:00–23:59
          arası %25, yaş pasta 17:00–20:00 arası %30. Saatler 24 saat formatında ve Almatı (KZ)
          saatine göredir. İndirim yalnızca seçilen saat aralığında sitede görünür.
        </p>
      </div>

      {message ? <p className="mb-3 text-sm text-green-700">{message}</p> : null}
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <div className="rounded-xl border border-dashed border-border bg-cream/60 p-4">
        <h3 className="text-sm font-semibold">Yeni kural ekle</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-muted">
              Ürün (stokta olanlar)
            </label>
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
                        {getLocalizedProductName(p, 'tr')} — {formatPrice(Number(p.price))} · stok:{' '}
                        {p.stock_quantity}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">İndirim oranı (%)</label>
            <input
              type="number"
              min={1}
              max={90}
              step={1}
              className="input-field w-full"
              value={draft.discountPercent}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  discountPercent: clampDiscount(Number(e.target.value)),
                }))
              }
            />
            <p className="mt-1 text-[11px] text-muted">Varsayılan %25 — 30, 50 vb. yazabilirsiniz</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Başlangıç (24s)</label>
            <TimeInput24
              value={draft.startTime}
              onChange={(startTime) => setDraft((d) => ({ ...d, startTime }))}
              disabled={isPending}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Bitiş (24s)</label>
            <TimeInput24
              value={draft.endTime}
              onChange={(endTime) => setDraft((d) => ({ ...d, endTime }))}
              disabled={isPending}
            />
          </div>
        </div>
        {selectedProduct ? (
          <p className="mt-2 text-xs text-muted">
            Önizleme: {getLocalizedName(selectedProduct, 'tr')}{' '}
            {formatPrice(Number(selectedProduct.price))} →{' '}
            {formatPrice(
              Math.round(Number(selectedProduct.price) * (1 - draft.discountPercent / 100))
            )}{' '}
            (%{draft.discountPercent} indirim)
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
        <p className="mt-4 text-sm text-muted">Henüz gün sonu indirimi kuralı yok.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rules.map((rule) => {
            const product = slugToProduct.get(rule.product_slug);
            const name = product
              ? getLocalizedProductName(product, 'tr')
              : rule.product_slug;
            const liveNow =
              rule.is_active &&
              isClearanceWindowActive(rule.start_time, rule.end_time);

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
                      %{rule.discount_percent} indirim · {formatClearanceTime(rule.start_time)} –{' '}
                      {formatClearanceTime(rule.end_time)}
                      {product ? ` · stok: ${product.stock_quantity}` : ''}
                    </p>
                    {rule.is_active ? (
                      liveNow ? (
                        <p className="mt-1 text-xs font-semibold text-green-700">
                          Şu an sitede görünüyor (Almatı {STORE_TIMEZONE})
                        </p>
                      ) : (
                        <p className="mt-1 text-xs font-medium text-amber-800">
                          Saat penceresi dışında — sitede henüz görünmez. Pencere:{' '}
                          {formatClearanceTime(rule.start_time)}–{formatClearanceTime(rule.end_time)}
                        </p>
                      )
                    ) : (
                      <p className="mt-1 text-xs text-muted">Pasif — sitede görünmez</p>
                    )}
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
                    <label className="text-xs text-muted">İndirim oranı (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      step={1}
                      className="input-field mt-0.5 w-full"
                      defaultValue={rule.discount_percent}
                      onBlur={(e) => {
                        const v = clampDiscount(Number(e.target.value));
                        if (v !== rule.discount_percent) {
                          updateRule(rule, { discount_percent: v });
                        }
                      }}
                    />
                  </div>
                  <RuleTimeField
                    label="Başlangıç (24s)"
                    initial={rule.start_time}
                    disabled={isPending}
                    onCommit={(start_time) => updateRule(rule, { start_time })}
                  />
                  <RuleTimeField
                    label="Bitiş (24s)"
                    initial={rule.end_time}
                    disabled={isPending}
                    onCommit={(end_time) => updateRule(rule, { end_time })}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
