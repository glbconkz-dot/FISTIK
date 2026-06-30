'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getAdminUser } from '@/lib/supabase/server';
import { getCatalogData } from '@/lib/catalog';
import { revalidateStorefront } from '@/lib/revalidate-storefront';
import { countConfiguredSections } from '@/lib/storefront-utils';
import type { StorefrontSectionKey } from '@/types';

async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}

export type SaveStorefrontResult =
  | {
      ok: true;
      updatedAt: string;
      slugCount: number;
      liveSectionCount: number;
      storefrontError: string | null;
    }
  | { ok: false; error: string };

export async function saveStorefrontSection(
  key: StorefrontSectionKey,
  productIds: string[],
  productSlugs: string[]
): Promise<SaveStorefrontResult> {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const uniqueSlugs = [...new Set(productSlugs.filter(Boolean))].slice(0, 8);
    const uniqueIds = [...new Set(productIds.filter(Boolean))].slice(0, 8);
    const updatedAt = new Date().toISOString();

    let { error } = await supabase.from('storefront_sections').upsert(
      {
        key,
        product_ids: uniqueIds,
        product_slugs: uniqueSlugs,
        updated_at: updatedAt,
      },
      { onConflict: 'key' }
    );

    if (error?.message.includes('product_slugs')) {
      ({ error } = await supabase.from('storefront_sections').upsert(
        {
          key,
          product_ids: uniqueIds,
          updated_at: updatedAt,
        },
        { onConflict: 'key' }
      ));

      if (!error) {
        return {
          ok: false,
          error:
            "product_slugs sütunu yok. Supabase'de 010_storefront_slugs.sql çalıştırın, sonra tekrar kaydedin.",
        };
      }
    }

    if (error) {
      if (
        error.message.includes('storefront_sections') ||
        error.message.includes('does not exist')
      ) {
        return {
          ok: false,
          error:
            "Vitrin tablosu yok. Supabase → SQL Editor'de supabase/fix-storefront-now.sql dosyasini calistirin. (" +
            error.message +
            ')',
        };
      }
      return { ok: false, error: error.message };
    }

    revalidatePath('/admin/storefront');
    revalidateStorefront();

    const live = await getCatalogData();

    return {
      ok: true,
      updatedAt,
      slugCount: uniqueSlugs.length,
      liveSectionCount: countConfiguredSections(live.storefrontSections),
      storefrontError: live.storefrontError,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Kaydedilemedi' };
  }
}

export async function verifyStorefrontSync(): Promise<{
  sections: Awaited<ReturnType<typeof getCatalogData>>['storefrontSections'];
  error: string | null;
  source: string;
}> {
  await requireAdmin();
  const data = await getCatalogData();
  return {
    sections: data.storefrontSections,
    error: data.storefrontError,
    source: data.source,
  };
}
