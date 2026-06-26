'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { upsertProduct, uploadProductImage } from '@/app/actions/admin-products';
import type { Category, Product } from '@/types';

interface AdminProductFormProps {
  categories: Category[];
  product?: Product;
}

type LangTab = 'kk' | 'tr' | 'ru' | 'en';

const LANG_TABS: { key: LangTab; label: string }[] = [
  { key: 'kk', label: 'KZ' },
  { key: 'tr', label: 'TR' },
  { key: 'ru', label: 'RU' },
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
  const [tab, setTab] = useState<LangTab>('tr');
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { url } = await uploadProductImage(formData);
      setImageUrl(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
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
          <select name="categoryId" className="input-field" defaultValue={product?.category_id ?? ''}>
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_tr || c.name_en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Price</label>
          <input name="price" type="number" min="0" step="0.01" className="input-field" defaultValue={product?.price ?? ''} required />
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
            defaultValue={product?.stock_quantity ?? 30}
          />
          <p className="mt-1 text-xs text-muted">Sabah kaç adet satışa açıyorsanız buraya yazın. Sipariş geldikçe düşer.</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Product image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        {uploading && <p className="mt-1 text-sm text-muted">Uploading...</p>}
        {imageUrl && (
          <div className="relative mt-3 h-32 w-32 overflow-hidden rounded-lg">
            <Image src={imageUrl} alt="Preview" fill className="object-cover" />
          </div>
        )}
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="isActive" defaultChecked={product?.is_active ?? true} />
        <span className="text-sm">Active</span>
      </label>

      <button type="submit" className="btn-primary" disabled={isPending || uploading}>
        {isPending ? 'Saving...' : product ? 'Update product' : 'Create product'}
      </button>
    </form>
  );
}
