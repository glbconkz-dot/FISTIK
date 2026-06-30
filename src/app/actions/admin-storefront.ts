'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getAdminUser } from '@/lib/supabase/server';
import { revalidateStorefront } from '@/lib/revalidate-storefront';
import type { StorefrontSectionKey } from '@/types';

async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}

export async function saveStorefrontSection(
  key: StorefrontSectionKey,
  productIds: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const uniqueIds = [...new Set(productIds.filter(Boolean))].slice(0, 8);

    const { error } = await supabase
      .from('storefront_sections')
      .upsert(
        {
          key,
          product_ids: uniqueIds,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      if (error.message.includes('storefront_sections')) {
        return {
          ok: false,
          error: 'Vitrin tablosu yok. Supabase SQL Editor\'de 007_storefront_categories.sql çalıştırın.',
        };
      }
      return { ok: false, error: error.message };
    }

    revalidatePath('/admin/storefront');
    revalidateStorefront();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Kaydedilemedi' };
  }
}
