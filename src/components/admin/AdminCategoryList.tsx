'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { upsertCategory, uploadCategoryImage } from '@/app/actions/admin-products';
import type { Category } from '@/types';

interface AdminCategoryListProps {
  categories: Category[];
}

export function AdminCategoryList({ categories }: AdminCategoryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editing = categories.find((c) => c.id === editingId);

  const handleImageUpload = async (categoryId: string, file: File) => {
    setUploadingId(categoryId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { url } = await uploadCategoryImage(formData);
      const cat = categories.find((c) => c.id === categoryId);
      if (!cat) return;

      startTransition(async () => {
        await upsertCategory({
          categoryId: cat.id,
          slug: cat.slug,
          nameEn: cat.name_en,
          nameRu: cat.name_ru,
          nameKk: cat.name_kk,
          nameTr: cat.name_tr,
          sortOrder: cat.sort_order,
          isActive: cat.is_active,
          imageUrl: url,
          showOnHome: cat.show_on_home !== false,
        });
        setEditingId(null);
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Yükleme başarısız');
    } finally {
      setUploadingId(null);
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>, cat: Category) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      await upsertCategory({
        categoryId: cat.id,
        slug: (form.get('slug') as string) || cat.slug,
        nameEn: form.get('nameEn') as string,
        nameRu: form.get('nameRu') as string,
        nameKk: form.get('nameKk') as string,
        nameTr: form.get('nameTr') as string,
        sortOrder: Number(form.get('sortOrder') ?? cat.sort_order),
        isActive: form.get('isActive') === 'on',
        showOnHome: form.get('showOnHome') === 'on',
        imageUrl: (form.get('imageUrl') as string) || cat.image_url || '',
      });
      setEditingId(null);
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Ana sayfadaki kategori kartlarının isimlerini ve kapak fotoğrafını buradan düzenleyin.
        Kapak boşsa ilk ürün fotoğrafı kullanılır.
      </p>

      <div className="space-y-3">
        {categories.map((cat) => {
          const isOpen = editingId === cat.id;
          const cover = cat.image_url?.trim();

          return (
            <div key={cat.id} className="luxury-card overflow-hidden">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-cream">
                  {cover ? (
                    <Image src={cover} alt={cat.name_tr} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">Kapak yok</div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{cat.name_tr || cat.name_ru}</p>
                  <p className="text-xs text-muted">
                    {cat.slug} · sıra {cat.sort_order}
                    {!cat.is_active ? ' · pasif' : ''}
                    {cat.show_on_home === false ? ' · ana sayfada gizli' : ''}
                  </p>
                  <p className="mt-1 text-sm text-muted">{cat.name_ru}</p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <label className="btn-outline cursor-pointer text-sm">
                    {uploadingId === cat.id ? '…' : 'Kapak yükle'}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploadingId === cat.id || isPending}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(cat.id, file);
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
                  className="space-y-3 border-t border-border bg-cream/40 p-4"
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

                  <label className="block text-sm">
                    <span className="mb-1 block font-medium">Kapak URL</span>
                    <input
                      name="imageUrl"
                      defaultValue={cat.image_url ?? ''}
                      className="input-field"
                      placeholder="Yükle veya URL yapıştır"
                    />
                  </label>

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
