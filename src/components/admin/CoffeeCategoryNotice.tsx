'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ensureCoffeeCategory } from '@/app/actions/admin-products';
import { COFFEE_CATEGORY_SLUG } from '@/lib/coffee';
import type { Category } from '@/types';

interface CoffeeCategoryNoticeProps {
  categories: Category[];
}

export function CoffeeCategoryNotice({ categories }: CoffeeCategoryNoticeProps) {
  const router = useRouter();
  const hasCoffee = categories.some((c) => c.slug === COFFEE_CATEGORY_SLUG);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleEnsure = () => {
    startTransition(async () => {
      const result = await ensureCoffeeCategory();
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setMessage(result.created ? 'Fıstık Signature kategorisi oluşturuldu.' : 'Fıstık Signature kategorisi zaten var.');
      router.refresh();
    });
  };

  return (
    <div className="mb-6 rounded-xl border border-border bg-pistachio-soft/60 px-4 py-3 text-sm">
      <p className="font-medium text-foreground">B2C İçecekler</p>
      <p className="mt-1 text-muted">
        Menü → İçecekler: Fıstık Signature, Çikolata Serisi, Çaylar, Diğer. Ana sayfada ve B2B’de
        yok. Fotoğrafları portre yükleyin.
      </p>
      {hasCoffee ? (
        <p className="mt-2 text-xs text-accent">Fıstık Signature hazır — ürün ekleyebilirsiniz.</p>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={handleEnsure}
          className="btn-primary mt-3 px-4 py-2 text-sm"
        >
          {isPending ? 'Oluşturuluyor…' : 'Fıstık Signature kategorisini oluştur'}
        </button>
      )}
      {message ? <p className="mt-2 text-xs text-muted">{message}</p> : null}
    </div>
  );
}
