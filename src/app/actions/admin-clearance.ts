'use server';

import { revalidatePath } from 'next/cache';
import { createClient, getAdminUser } from '@/lib/supabase/server';
import { revalidateStorefront } from '@/lib/revalidate-storefront';
import type { ClearanceRule } from '@/types';

async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) throw new Error('Unauthorized');
  return admin;
}

export type SaveClearanceResult =
  | { ok: true; updatedAt: string }
  | { ok: false; error: string };

export type ClearanceInput = {
  productSlug: string;
  productId: string;
  discountPercent: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  sortOrder: number;
};

function normalizeTime(value: string): string {
  const trimmed = value.trim().slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(trimmed)) {
    throw new Error('Geçersiz saat formatı (HH:MM)');
  }
  return trimmed;
}

export async function saveClearanceItem(input: ClearanceInput): Promise<SaveClearanceResult> {
  try {
    await requireAdmin();

    if (input.discountPercent < 1 || input.discountPercent > 90) {
      return { ok: false, error: 'İndirim %1–90 arasında olmalı' };
    }

    const supabase = await createClient();
    const updatedAt = new Date().toISOString();

    const { error } = await supabase.from('storefront_clearance').upsert(
      {
        product_slug: input.productSlug,
        product_id: input.productId,
        discount_percent: input.discountPercent,
        start_time: normalizeTime(input.startTime),
        end_time: normalizeTime(input.endTime),
        is_active: input.isActive,
        sort_order: input.sortOrder,
        updated_at: updatedAt,
      },
      { onConflict: 'product_slug' }
    );

    if (error) {
      if (
        error.message.includes('storefront_clearance') ||
        error.message.includes('does not exist')
      ) {
        return {
          ok: false,
          error:
            "Gün sonu indirimi tablosu yok. Supabase'de 025_storefront_clearance.sql çalıştırın.",
        };
      }
      return { ok: false, error: error.message };
    }

    revalidatePath('/admin/storefront');
    revalidateStorefront();

    return { ok: true, updatedAt };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Kaydedilemedi' };
  }
}

export async function deleteClearanceItem(id: string): Promise<SaveClearanceResult> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const updatedAt = new Date().toISOString();

    const { error } = await supabase.from('storefront_clearance').delete().eq('id', id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/admin/storefront');
    revalidateStorefront();

    return { ok: true, updatedAt };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Silinemedi' };
  }
}

export async function toggleClearanceActive(
  id: string,
  isActive: boolean
): Promise<SaveClearanceResult> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const updatedAt = new Date().toISOString();

    const { error } = await supabase
      .from('storefront_clearance')
      .update({ is_active: isActive, updated_at: updatedAt })
      .eq('id', id);

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath('/admin/storefront');
    revalidateStorefront();

    return { ok: true, updatedAt };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Güncellenemedi' };
  }
}

export async function listClearanceRules(): Promise<{
  rules: ClearanceRule[];
  error: string | null;
}> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('storefront_clearance')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    return { rules: [], error: error.message };
  }

  return { rules: (data as ClearanceRule[]) ?? [], error: null };
}
