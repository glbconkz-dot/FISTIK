'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProduct, upsertProduct, uploadProductImage } from '@/app/actions/admin-products';
import { getDisplayCategories } from '@/lib/category-display';
import { isDrinksCategorySlug } from '@/lib/coffee';
import { getLocalizedName } from '@/lib/utils';
import type { Category, Product } from '@/types';

interface AdminProductFormProps {
  categories: Category[];
  product?: Product;
}

type LangTab = 'kk' | 'ru' | 'tr' | 'en';

const LANG_TABS: { key: LangTab; label: string }[] = [
  { key: 'kk', label: 'KZ' },
  { key: 'ru', label: 'RU' },
  { key: 'tr', label: 'TR' },
  { key: 'en', label: 'EN' },
];

const FIELD_MAP: Record<LangTab, { name: keyof Product; description: keyof Product }> = {
  kk: { name: 'name_kk', description: 'description_kk' },
  tr: { name: 'name_tr', description: 'description_tr' },
  ru: { name: 'name_ru', description: 'description_ru' },
  en: { name: 'name_en', description: 'description_en' },
};

const FORM_NAMES: Record<LangTab, { name: string; description: string }> = {
  kk: { name: 'nameKk', description: 'descriptionKk' },
  tr: { name: 'nameTr', description: 'descriptionTr' },
  ru: { name: 'nameRu', description: 'descriptionRu' },
  en: { name: 'nameEn', description: 'descriptionEn' },
};

export function AdminProductForm({ categories, product }: AdminProductFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<LangTab>('tr');
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePin, setDeletePin] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bakeryCategories = getDisplayCategories(categories);
  const drinkCategories = categories
    .filter((c) => c.is_active && isDrinksCategorySlug(c.slug))
    .sort((a, b) => a.sort_order - b.sort_order);
  const displayCategories = [...bakeryCategories, ...drinkCategories];
  const frozenCategory = categories.find((category) => category.slug === 'frozen-boreks');
  const semiFinishedCategory = categories.find((category) => category.slug === 'semi-finished');
  const defaultCategoryId =
    product?.category_id && frozenCategory && product.category_id === frozenCategory.id
      ? (semiFinishedCategory?.id ?? product.category_id)
      : (product?.category_id ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(defaultCategoryId);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const isDrinksProduct = selectedCategory
    ? isDrinksCategorySlug(selectedCategory.slug)
    : false;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadNote(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { url } = await uploadProductImage(formData);
      setImageUrl(url);
      setUploadNote('Resim yüklendi — kaydetmek için Update product’a basın.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaveError(null);

    startTransition(async () => {
      try {
        await upsertProduct(
          {
            slug: (form.get('slug') as string) || '',
            categoryId: form.get('categoryId') as string,
            nameEn: form.get('nameEn') as string,
            nameRu: form.get('nameRu') as string,
            nameKk: form.get('nameKk') as string,
            nameTr: form.get('nameTr') as string,
            descriptionEn: form.get('descriptionEn') as string,
            descriptionRu: form.get('descriptionRu') as string,
            descriptionKk: form.get('descriptionKk') as string,
            descriptionTr: form.get('descriptionTr') as string,
            price: Number(form.get('price')),
            imageUrl,
            isActive: form.get('isActive') === 'on',
            stockQuantity: Number(form.get('stockQuantity') || 30),
            sortOrder: Number(form.get('sortOrder') || 0),
          },
          product?.id
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : '';
        if (
          msg.includes('NEXT_REDIRECT') ||
          (err as { digest?: string })?.digest?.includes('NEXT_REDIRECT')
        ) {
          return;
        }
        setSaveError(msg || 'Kayıt başarısız');
      }
    });
  };

  const handleDelete = () => {
    if (!product?.id) return;
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteProduct(product.id, deletePin);
      if (result.ok) {
        router.push('/admin/products');
        router.refresh();
        return;
      }
      setDeleteError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="luxury-card max-w-2xl space-y-5 p-6">
      <div className="flex gap-2 overflow-x-auto">
        {LANG_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`chip shrink-0 ${tab === t.key ? 'chip-active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {LANG_TABS.map(({ key: lang }) => (
        <div key={lang} className={tab === lang ? 'space-y-3' : 'hidden'}>
          <div>
            <label className="mb-1 block text-sm font-medium">Name ({lang.toUpperCase()})</label>
            <input
              name={FORM_NAMES[lang].name}
              className="input-field"
              defaultValue={String(product?.[FIELD_MAP[lang].name] ?? '')}
              required={lang === 'tr'}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Description ({lang.toUpperCase()})
            </label>
            <textarea
              name={FORM_NAMES[lang].description}
              className="input-field min-h-[100px]"
              defaultValue={String(product?.[FIELD_MAP[lang].description] ?? '')}
            />
          </div>
        </div>
      ))}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <input name="slug" className="input-field" defaultValue={product?.slug ?? ''} placeholder="auto from TR name" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select
            name="categoryId"
            className="input-field"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">— None —</option>
            {displayCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {getLocalizedName(c, 'tr')}
              </option>
            ))}
          </select>
          {isDrinksProduct ? (
            <p className="mt-1 text-xs text-accent">
              İçecek menüsü: dikey (portre) fotoğraf yükleyin — sitede 3:4 oranında gösterilir.
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Fiyat (₸)</label>
          <input name="price" type="number" min="0" step="1" className="input-field" defaultValue={product?.price != null ? Math.round(Number(product.price)) : ''} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Sort order</label>
          <input name="sortOrder" type="number" className="input-field" defaultValue={product?.sort_order ?? 0} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Online stock (adet)</label>
          <input
            name="stockQuantity"
            type="number"
            min="0"
            step="1"
            className="input-field"
            defaultValue={product?.stock_quantity ?? 8}
          />
          <p className="mt-1 text-xs text-muted">Sabah kaç adet satışa açıyorsanız buraya yazın. Sipariş geldikçe düşer.</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Ürün resmi</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        {isDrinksProduct ? (
          <p className="mt-1 text-xs text-muted">
            Öneri: dikey / portre çekim (telefon dikey). Yatay fotoğraf kırpılır.
          </p>
        ) : null}
        {uploading && <p className="mt-1 text-sm text-muted">Yükleniyor…</p>}
        {uploadNote && <p className="mt-1 text-sm text-accent">{uploadNote}</p>}
        {imageUrl ? (
          <div className="relative mt-3 h-40 w-40 overflow-hidden rounded-lg border border-border bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Önizleme" className="h-full w-full object-cover" />
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted">Henüz resim yok — dosya seçin.</p>
        )}
        {product?.image_urls && product.image_urls.length > 0 ? (
          <div className="mt-3">
            <p className="mb-1.5 text-xs text-muted">
              Ek galeri ({product.image_urls.length}) — site dosyalarından; ana resmi admin yüklemesiyle değişir
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.image_urls.map((url) => (
                <div
                  key={url}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="isActive" defaultChecked={product?.is_active ?? true} />
        <span className="text-sm">Active</span>
      </label>

      {saveError && <p className="text-sm text-red-600">{saveError}</p>}

      <button type="submit" className="btn-primary" disabled={isPending || uploading}>
        {isPending ? 'Saving...' : product ? 'Update product' : 'Create product'}
      </button>

      {product ? (
        <div className="border-t border-border pt-5">
          {!deleteOpen ? (
            <button
              type="button"
              className="btn-outline border-red-300 text-red-700"
              onClick={() => setDeleteOpen(true)}
            >
              Ürünü sil…
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">
                Silmek için 4 haneli kodu girin (admin şifresi yetmez).
              </p>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                className="input-field max-w-[8rem] tracking-widest"
                placeholder="••••"
                value={deletePin}
                onChange={(e) => setDeletePin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
              {deleteError ? <p className="text-sm text-red-700">{deleteError}</p> : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isPending || deletePin.length !== 4}
                  onClick={handleDelete}
                  className="rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Kalıcı olarak sil
                </button>
                <button
                  type="button"
                  className="btn-outline text-sm"
                  onClick={() => {
                    setDeleteOpen(false);
                    setDeletePin('');
                    setDeleteError(null);
                  }}
                >
                  Vazgeç
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </form>
  );
}
