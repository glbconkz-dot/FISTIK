import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/supabase/server';
import { tryCreateServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

/**
 * Returns a tiny signed upload slot. The image itself is uploaded from the browser
 * directly to Supabase — never through Vercel Server Actions / RSC.
 */
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz. Admin girişi gerekli.' }, { status: 401 });
    }

    let ext = 'jpg';
    try {
      const body = (await request.json()) as { ext?: string; contentType?: string };
      ext = (body.ext || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    } catch {
      // default jpg
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const supabase = tryCreateServiceClient() ?? (await createClient());

    const { data, error } = await supabase.storage
      .from('product-images')
      .createSignedUploadUrl(fileName, { upsert: true });

    if (error || !data?.path || !data?.token) {
      const message = error?.message?.includes('Bucket not found')
        ? 'Supabase Storage: product-images bucket yok.'
        : error?.message || 'Yükleme slot’u oluşturulamadı';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(data.path);

    if (!publicUrl) {
      return NextResponse.json({ error: 'Yükleme URL’si alınamadı' }, { status: 500 });
    }

    return NextResponse.json({
      path: data.path,
      token: data.token,
      publicUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sunucu hatası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
