'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { deleteCategory, upsertCategory } from '@/app/actions/admin-products';
import { useAdminLocale } from '@/components/admin/AdminLocaleProvider';
import { uploadAdminProductImage } from '@/lib/upload-admin-image';
import { getLocalizedName, slugify } from '@/lib/utils';
import type { Category } from '@/types';

interface AdminCategoryListProps {
  categories: Category[];
}

const emptyCreate = {
  slug: '',
  nameTr: '',
  nameRu: '',
  nameKk: '',
  nameEn: '',
  sortOrder: 100,
  isActive: true,
  showOnHome: true,
  imageUrl: '',
};

export function AdminCategoryList({ categories }: AdminCategoryListProps) {
  const { locale } = useAdminLocale();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const editing = categories.find((c) => c.id === editingId);
  const nextSort =
    categories.reduce((max, c) => Math.max(max, c.sort_order ?? 0), 0) + 10;

  const handleImageUpload = async (categoryId: string, file: File) => {
    setUploadingId(categoryId);
    setMessage(null);
    try {
      const url = await uploadAdminProductImage(file);
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
    setMessage(null);

    startTransition(async () => {
      try {
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
        setMessage('Kaydedildi');
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Kayıt başarısız');
      }
    });
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setMessage(null);

    const nameTr = (form.get('nameTr') as string)?.trim() || '';
    const nameRu = (form.get('nameRu') as string)?.trim() || nameTr;
    const nameKk = (form.get('nameKk') as string)?.trim() || nameTr;
    const nameEn = (form.get('nameEn') as string)?.trim() || nameTr;
    const slug =
      (form.get('slug') as string)?.trim() ||
      slugify(nameEn || nameTr || nameRu) ||
      `category-${Date.now()}`;

    if (!nameTr && !nameRu && !nameEn) {
      setMessage('En az bir dilde kategori adı girin.');
      return;
    }

    startTransition(async () => {
      try {
        await upsertCategory({
          slug,
          nameEn: nameEn || nameTr,
          nameRu: nameRu || nameTr,
          nameKk: nameKk || nameTr,
          nameTr: nameTr || nameEn || nameRu,
          sortOrder: Number(form.get('sortOrder') ?? nextSort),
          isActive: form.get('isActive') === 'on',
          showOnHome: form.get('showOnHome') === 'on',
          imageUrl: (form.get('imageUrl') as string) || '',
        });
        setCreating(false);
        setMessage('Kategori eklendi');
      } catch (err) {
        setMessage(err instanceof Error ? err.message : 'Eklenemedi');
      }
    });
  };

  const handleDelete = (cat: Category) => {
    if (
      !window.confirm(
        `"${getLocalizedName(cat, locale)}" kategorisini silmek istiyor musunuz?`
      )
    ) {
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await deleteCategory(cat.id);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      if (editingId === cat.id) setEditingId(null);
      setMessage('Kategori silindi');
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted">
          Ana sayfadaki kategori kartlarının isimlerini ve kapak fotoğrafını buradan
          düzenleyin. Kapak boşsa ilk ürün fotoğrafı kullanılır. Yeni kategori
          ekleyebilir veya ürünü olmayan kategorileri silebilirsiniz.
        </p>
        <button
          type="button"
          className="btn-primary shrink-0 text-sm"
          onClick={() => {
            setCreating((v) => !v);
            setEditingId(null);
            setMessage(null);
          }}
        >
          {creating ? 'Vazgeç' : '+ Yeni kategori'}
        </button>
      </div>

      {message ? <p className="text-sm text-pistachio-dark">{message}</p> : null}

      {creating ? (
        <form onSubmit={handleCreate} className="luxury-card space-y-3 p-4">
          <h2 className="font-display text-lg font-semibold">Yeni kategori</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Slug</span>
              <input
                name="slug"
                defaultValue={emptyCreate.slug}
                className="input-field"
                placeholder="örn: mini-tart"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Sıra</span>
              <input
                name="sortOrder"
                type="number"
                defaultValue={nextSort}
                className="input-field"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Türkçe ad</span>
              <input name="nameTr" className="input-field" required />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Rusça ad</span>
              <input name="nameRu" className="input-field" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Kazakça ad</span>
              <input name="nameKk" className="input-field" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">İngilizce ad</span>
              <input name="nameEn" className="input-field" />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Kapak URL</span>
            <input name="imageUrl" className="input-field" placeholder="İsteğe bağlı" />
          </label>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isActive" defaultChecked />
              Aktif
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="showOnHome" defaultChecked />
              Ana sayfada göster
            </label>
          </div>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? 'Ekleniyor…' : 'Kategori ekle'}
          </button>
        </form>
      ) : null}

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

                <div className="flex shrink-0 flex-wrap gap-2">
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
                    onClick={() => {
                      setEditingId(isOpen ? null : cat.id);
                      setCreating(false);
                    }}
                  >
                    {isOpen ? 'Kapat' : 'Düzenle'}
                  </button>
                  <button
                    type="button"
                    className="btn-outline text-sm text-red-700"
                    disabled={isPending}
                    onClick={() => handleDelete(cat)}
                  >
                    Sil
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
