'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { upsertCategory } from '@/app/actions/admin-products';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import {
  getCategoryGroupSlugs,
  productMatchesCategoryFilter,
} from '@/lib/category-display';
import { CATEGORY_COVER_OPTIONS } from '@/lib/category-utils';
import { uploadAdminProductImage } from '@/lib/upload-admin-image';
import { getLocalizedName } from '@/lib/utils';
import type { Category, Product } from '@/types';

interface AdminCategoryListProps {
  categories: Category[];
  allCategories: Category[];
  products: Product[];
}

type CoverOption = {
  url: string;
  label: string;
};

function uniqueCoverOptions(products: Product[], locale: 'kk' | 'ru' | 'tr' | 'en'): CoverOption[] {
  const seen = new Set<string>();
  const options: CoverOption[] = [];

  for (const product of products) {
    const name = getLocalizedName(product, locale);
    const urls = [product.image_url, ...(product.image_urls ?? [])]
      .map((u) => u?.trim())
      .filter((u): u is string => Boolean(u));

    for (const url of urls) {
      if (seen.has(url)) continue;
      seen.add(url);
      options.push({ url, label: name });
    }
  }

  return options;
}

export function AdminCategoryList({
  categories,
  allCategories,
  products,
}: AdminCategoryListProps) {
  const router = useRouter();
  const { locale } = useAdminLocale();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [coverById, setCoverById] = useState<Record<string, string>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editing = categories.find((c) => c.id === editingId);

  const coverOptionsFor = useMemo(() => {
    const map = new Map<string, CoverOption[]>();
    for (const cat of categories) {
      const inCat = products
        .filter((p) => productMatchesCategoryFilter(p, cat.slug, allCategories))
        .sort((a, b) => a.sort_order - b.sort_order || a.name_en.localeCompare(b.name_en));
      const fromProducts = uniqueCoverOptions(inCat, locale);
      const presets = CATEGORY_COVER_OPTIONS[cat.slug] ?? [];
      const seen = new Set(presets.map((p) => p.url));
      const merged = [
        ...presets,
        ...fromProducts.filter((o) => !seen.has(o.url)),
      ];
      map.set(cat.id, merged);
    }
    return map;
  }, [categories, allCategories, products, locale]);

  const selectedCover = (cat: Category) =>
    (coverById[cat.id] ?? cat.image_url ?? '').trim();

  const saveCover = (cat: Category, imageUrl: string) => {
    setStatusNote(null);
    startTransition(async () => {
      const result = await upsertCategory({
        categoryId: cat.id,
        slug: cat.slug,
        nameEn: cat.name_en,
        nameRu: cat.name_ru,
        nameKk: cat.name_kk,
        nameTr: cat.name_tr,
        sortOrder: cat.sort_order,
        isActive: cat.is_active,
        imageUrl,
        showOnHome: cat.show_on_home !== false,
      });
      if (!result.ok) {
        setStatusNote(result.error);
        return;
      }
      setCoverById((prev) => ({ ...prev, [cat.id]: imageUrl }));
      setStatusNote('Kapak güncellendi.');
      router.refresh();
    });
  };

  const handleImageUpload = async (categoryId: string, file: File) => {
    setUploadingId(categoryId);
    setStatusNote(null);
    try {
      const url = await uploadAdminProductImage(file);
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) return;
      setCoverById((prev) => ({ ...prev, [categoryId]: url }));
      saveCover(cat, url);
    } catch (err) {
      setStatusNote(err instanceof Error ? err.message : 'Yükleme başarısız');
    } finally {
      setUploadingId(null);
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>, cat: Category) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatusNote(null);

    startTransition(async () => {
      const result = await upsertCategory({
        categoryId: cat.id,
        slug: (form.get('slug') as string) || cat.slug,
        nameEn: form.get('nameEn') as string,
        nameRu: form.get('nameRu') as string,
        nameKk: form.get('nameKk') as string,
        nameTr: form.get('nameTr') as string,
        sortOrder: Number(form.get('sortOrder') ?? cat.sort_order),
        isActive: form.get('isActive') === 'on',
        showOnHome: form.get('showOnHome') === 'on',
        imageUrl: selectedCover(cat),
      });
      if (!result.ok) {
        setStatusNote(result.error);
        return;
      }
      setStatusNote('Kategori kaydedildi.');
      setEditingId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Ana sayfa kategori kartı kapağını, o kategorideki ürün fotoğraflarından tıklayarak
        seçin. İsterseniz yeni fotoğraf da yükleyebilirsiniz.
      </p>
      {statusNote ? (
        <p className="rounded-lg border border-border bg-cream/50 px-3 py-2 text-sm text-accent">
          {statusNote}
        </p>
      ) : null}

      <div className="space-y-3">
        {categories.map((cat) => {
          const isOpen = editingId === cat.id;
          const cover = selectedCover(cat);
          const options = coverOptionsFor.get(cat.id) ?? [];
          const groupHint = getCategoryGroupSlugs(cat.slug).join(', ');

          return (
            <div key={cat.id} className="luxury-card overflow-hidden">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-cream">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin preview
                    <img src={cover} alt={cat.name_tr} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">
                      Kapak yok
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{getLocalizedName(cat, locale)}</p>
                  <p className="text-xs text-muted">
                    {cat.slug} · sıra {cat.sort_order}
                    {!cat.is_active ? ' · pasif' : ''}
                    {cat.show_on_home === false ? ' · ana sayfada gizli' : ''}
                  </p>
                  <p className="mt-1 text-sm text-muted">{cat.name_ru}</p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <label className="btn-outline cursor-pointer text-sm">
                    {uploadingId === cat.id ? '…' : 'Yeni yükle'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp"
                      className="sr-only"
                      disabled={uploadingId === cat.id || isPending}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        if (file) void handleImageUpload(cat.id, file);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-primary text-sm"
                    onClick={() => setEditingId(isOpen ? null : cat.id)}
                  >
                    {isOpen ? 'Kapat' : 'Düzenle'}
                  </button>
                </div>
              </div>

              {isOpen && editing?.id === cat.id ? (
                <form
                  onSubmit={(e) => handleSave(e, cat)}
                  className="space-y-4 border-t border-border bg-cream/40 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium">Slug</span>
                      <input name="slug" defaultValue={cat.slug} className="input-field" />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium">Sıra</span>
                      <input
                        name="sortOrder"
                        type="number"
                        defaultValue={cat.sort_order}
                        className="input-field"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium">Türkçe ad</span>
                      <input name="nameTr" defaultValue={cat.name_tr} className="input-field" />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium">Rusça ad</span>
                      <input name="nameRu" defaultValue={cat.name_ru} className="input-field" />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium">Kazakça ad</span>
                      <input name="nameKk" defaultValue={cat.name_kk} className="input-field" />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block font-medium">İngilizce ad</span>
                      <input name="nameEn" defaultValue={cat.name_en} className="input-field" />
                    </label>
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">Kapak görseli seç</p>
                        <p className="text-xs text-muted">
                          Bu kategorideki ürün fotoğrafları ({groupHint}). Tıklayın — hemen
                          uygulanır.
                        </p>
                      </div>
                      {cover ? (
                        <button
                          type="button"
                          className="text-xs text-red-600 underline"
                          disabled={isPending}
                          onClick={() => {
                            setCoverById((prev) => ({ ...prev, [cat.id]: '' }));
                            saveCover(cat, '');
                          }}
                        >
                          Kapağı temizle
                        </button>
                      ) : null}
                    </div>

                    {options.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
                        Bu kategoride henüz ürün fotoğrafı yok. “Yeni yükle” ile kapak ekleyin.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                        {options.map((opt) => {
                          const active = cover === opt.url;
                          return (
                            <button
                              key={opt.url}
                              type="button"
                              disabled={isPending}
                              title={opt.label}
                              onClick={() => {
                                setCoverById((prev) => ({ ...prev, [cat.id]: opt.url }));
                                saveCover(cat, opt.url);
                              }}
                              className={`group relative overflow-hidden rounded-xl border-2 bg-white text-left transition ${
                                active
                                  ? 'border-accent ring-2 ring-accent/30'
                                  : 'border-border hover:border-accent/50'
                              }`}
                            >
                              <div className="relative aspect-[4/3] w-full bg-cream">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={opt.url}
                                  alt={opt.label}
                                  className="h-full w-full object-cover"
                                />
                                {active ? (
                                  <span className="absolute right-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                    Kapak
                                  </span>
                                ) : null}
                              </div>
                              <p className="truncate px-1.5 py-1 text-[10px] text-muted">
                                {opt.label}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="isActive" defaultChecked={cat.is_active} />
                      Aktif
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="showOnHome"
                        defaultChecked={cat.show_on_home !== false}
                      />
                      Ana sayfada göster
                    </label>
                  </div>

                  <button type="submit" className="btn-primary" disabled={isPending}>
                    {isPending ? 'Kaydediliyor…' : 'Kaydet'}
                  </button>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
