'use client';

import { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  setAllProductStock,
  setProductStock,
  toggleProductActive,
} from '@/app/actions/admin-products';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductListProps {
  products: Product[];
}

function stockInputMap(products: Product[]) {
  return Object.fromEntries(
    products.map((p) => [p.id, String(Number(p.stock_quantity ?? 0))])
  ) as Record<string, string>;
}

function parseStockInput(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 0;
  return Math.min(9999, Math.max(0, Number.parseInt(digits, 10)));
}

export function ProductList({ products }: ProductListProps) {
  const router = useRouter();
  const [stockInputs, setStockInputs] = useState<Record<string, string>>(() =>
    stockInputMap(products)
  );
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setStockInputs(stockInputMap(products));
  }, [products]);

  const applyResult = (
    productId: string,
    result: { ok: true; stock: number } | { ok: false; error: string }
  ) => {
    if (result.ok) {
      setStockInputs((prev) => ({ ...prev, [productId]: String(result.stock) }));
      setError(null);
      setSavedId(productId);
      router.refresh();
      setTimeout(() => setSavedId(null), 1500);
    } else {
      setError(result.error);
    }
  };

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      try {
        await toggleProductActive(id, !current);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Durum güncellenemedi');
      }
    });
  };

  const handleStockInputChange = (id: string, raw: string) => {
    if (raw === '') {
      setStockInputs((prev) => ({ ...prev, [id]: '' }));
      return;
    }
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    setStockInputs((prev) => ({ ...prev, [id]: digits }));
  };

  const handleStockSave = (id: string) => {
    const parsed = parseStockInput(stockInputs[id] ?? '');
    setStockInputs((prev) => ({ ...prev, [id]: String(parsed) }));

    startTransition(async () => {
      const result = await setProductStock(id, parsed);
      applyResult(id, result);
    });
  };

  const handleSetAll30 = () => {
    startTransition(async () => {
      const result = await setAllProductStock(30);
      if (result.ok) {
        setStockInputs(Object.fromEntries(products.map((p) => [p.id, '30'])));
        setError(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const missingStockColumn = products.length > 0 && products.every((p) => p.stock_quantity == null);

  return (
    <div className="space-y-3">
      {missingStockColumn ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Stok sütunu veritabanında yok. Supabase SQL Editor&apos;de{' '}
          <strong>006_stock_quantity.sql</strong> dosyasını çalıştırın.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSetAll30}
          className="btn-outline text-sm"
        >
          Tüm ürünleri 30 adet yap
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {products.map((product) => {
        const stock = parseStockInput(stockInputs[product.id] ?? '0');
        const outOfStock = stock <= 0;

        return (
          <div key={product.id} className="luxury-card flex flex-wrap items-center gap-2.5 p-2.5 sm:gap-3 sm:p-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-border/30">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name_en}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-accent">F</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium sm:text-base">{product.name_en}</p>
              <p className="text-xs text-accent sm:text-sm">{formatPrice(Number(product.price))}</p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <input
                type="number"
                min={0}
                max={9999}
                step={1}
                inputMode="numeric"
                disabled={isPending}
                value={stockInputs[product.id] ?? ''}
                onChange={(e) => handleStockInputChange(product.id, e.target.value)}
                onFocus={(e) => e.target.select()}
                onBlur={() => handleStockSave(product.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="stock-qty-input"
                aria-label="Online stok adedi"
              />
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleStockSave(product.id)}
                className="btn-outline px-2.5 py-1.5 text-xs"
              >
                {savedId === product.id ? '✓' : 'Kaydet'}
              </button>
            </div>

            <span className="text-xs text-muted">{outOfStock ? 'Menüde gizli' : 'Satışta'}</span>

            <button
              type="button"
              disabled={isPending}
              onClick={() => handleToggle(product.id, product.is_active)}
              className={`chip shrink-0 ${product.is_active ? 'chip-active' : ''}`}
            >
              {product.is_active ? 'Active' : 'Inactive'}
            </button>
            <Link href={`/admin/products/${product.id}/edit`} className="btn-outline shrink-0 px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
              Edit
            </Link>
          </div>
        );
      })}
      {products.length === 0 && (
        <p className="py-8 text-center text-muted">Henüz ürün yok.</p>
      )}
    </div>
  );
}
