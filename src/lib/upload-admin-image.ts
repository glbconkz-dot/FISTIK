'use client';

import { createClient } from '@/lib/supabase/client';
import {
  compressImageForAdmin,
  friendlyUploadError,
} from '@/lib/admin-image-upload';

type UploadSlot = {
  path: string;
  token: string;
  publicUrl: string;
};

async function requestUploadSlot(ext: string, contentType: string): Promise<UploadSlot> {
  const res = await fetch('/api/admin/product-image-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ext, contentType }),
    credentials: 'same-origin',
  });

  const data = (await res.json().catch(() => ({}))) as {
    path?: string;
    token?: string;
    publicUrl?: string;
    error?: string;
  };

  if (!res.ok || !data.path || !data.token || !data.publicUrl) {
    throw new Error(data.error || `Yükleme hazırlığı başarısız (${res.status})`);
  }

  return {
    path: data.path,
    token: data.token,
    publicUrl: data.publicUrl,
  };
}

async function uploadViaSignedUrl(file: File): Promise<string> {
  const ext =
    (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const contentType = file.type || 'image/jpeg';
  const slot = await requestUploadSlot(ext, contentType);
  const supabase = createClient();

  const { error } = await supabase.storage
    .from('product-images')
    .uploadToSignedUrl(slot.path, slot.token, file, {
      upsert: true,
      contentType,
    });

  if (error) throw new Error(error.message);
  return slot.publicUrl;
}

async function uploadViaBrowserSession(file: File): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Oturum bulunamadı. Admin’e tekrar giriş yapın.');
  }

  const ext =
    (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const { error } = await supabase.storage.from('product-images').upload(fileName, file, {
    contentType: file.type || `image/${ext}`,
    upsert: true,
    cacheControl: '3600',
  });

  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from('product-images').getPublicUrl(fileName);

  if (!publicUrl) throw new Error('Yükleme URL’si alınamadı');
  return publicUrl;
}

/**
 * Compress in browser, then upload straight to Supabase Storage.
 * Does not use Server Actions (avoids production RSC digest errors).
 */
export async function uploadAdminProductImage(file: File): Promise<string> {
  try {
    const prepared = await compressImageForAdmin(file);

    try {
      return await uploadViaSignedUrl(prepared);
    } catch (signedErr) {
      try {
        return await uploadViaBrowserSession(prepared);
      } catch {
        throw signedErr;
      }
    }
  } catch (err) {
    throw new Error(friendlyUploadError(err));
  }
}
