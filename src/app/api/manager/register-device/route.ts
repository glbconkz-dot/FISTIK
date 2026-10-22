import { tryCreateServiceClient } from '@/lib/supabase/service';
import { isValidManagerAppSecret } from '@/lib/manager-push';
import { jsonWithCors, managerOptionsResponse } from '@/lib/manager-api-cors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function OPTIONS() {
  return managerOptionsResponse();
}

/** POST /api/manager/register-device — Expo push token kaydı */
export async function POST(request: Request) {
  if (!isValidManagerAppSecret(request.headers.get('authorization'))) {
    return jsonWithCors({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { expoPushToken?: string; deviceName?: string; platform?: string };
  try {
    body = await request.json();
  } catch {
    return jsonWithCors({ error: 'invalidJson' }, { status: 400 });
  }

  const token = body.expoPushToken?.trim() ?? '';
  if (!token.startsWith('ExponentPushToken[') && !token.startsWith('ExpoPushToken[')) {
    return jsonWithCors({ error: 'invalidToken' }, { status: 400 });
  }

  const supabase = tryCreateServiceClient();
  if (!supabase) {
    return jsonWithCors({ error: 'setup' }, { status: 503 });
  }

  const now = new Date().toISOString();
  const { error } = await supabase.from('admin_device_tokens').upsert(
    {
      expo_push_token: token,
      device_name: (body.deviceName ?? '').slice(0, 120),
      platform: body.platform === 'android' ? 'android' : 'ios',
      is_active: true,
      last_seen_at: now,
      updated_at: now,
    },
    { onConflict: 'expo_push_token' }
  );

  if (error) {
    console.error('register-device:', error.message);
    return jsonWithCors({ error: 'saveFailed', detail: error.message }, { status: 500 });
  }

  return jsonWithCors({ success: true });
}
