import { tryCreateServiceClient } from '@/lib/supabase/service';

export type NewOrderPushPayload = {
  orderNumber: string;
  channel: 'b2c' | 'b2b';
  customerName: string;
  companyName?: string;
  total: number;
  phone?: string;
};

type ExpoTicket =
  | { status: 'ok'; id: string }
  | {
      status: 'error';
      message?: string;
      details?: { error?: string; expoPushToken?: string };
    };

function getManagerAppSecret(): string | null {
  return process.env.MANAGER_APP_SECRET?.trim() || null;
}

export function isValidManagerAppSecret(headerValue: string | null): boolean {
  const expected = getManagerAppSecret();
  if (!expected) return false;
  if (!headerValue) return false;
  const token = headerValue.startsWith('Bearer ')
    ? headerValue.slice('Bearer '.length).trim()
    : headerValue.trim();
  return token.length > 0 && token === expected;
}

function formatMoney(total: number): string {
  return `${Math.round(total).toLocaleString('tr-TR')} ₸`;
}

function isExpoPushToken(value: string): boolean {
  return value.startsWith('ExponentPushToken[') || value.startsWith('ExpoPushToken[');
}

function buildNotification(payload: NewOrderPushPayload) {
  const channelLabel = payload.channel === 'b2b' ? 'B2B' : 'B2C';
  const who =
    payload.channel === 'b2b' && payload.companyName
      ? payload.companyName
      : payload.customerName;

  return {
    title: `Yeni ${channelLabel} sipariş`,
    body: `#${payload.orderNumber} · ${who} · ${formatMoney(payload.total)}`,
    data: {
      type: 'new_order',
      orderNumber: payload.orderNumber,
      channel: payload.channel,
      adminUrl: 'https://fistik.kz/admin/orders',
    },
    sound: 'default' as const,
    priority: 'high' as const,
    channelId: 'orders',
    ttl: 60 * 60,
    badge: 1,
  };
}

async function deactivateTokens(tokens: string[]): Promise<void> {
  if (tokens.length === 0) return;
  const supabase = tryCreateServiceClient();
  if (!supabase) return;
  const { error } = await supabase
    .from('admin_device_tokens')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .in('expo_push_token', tokens);
  if (error) {
    console.error('deactivateTokens:', error.message);
  }
}

async function sendExpoPush(messages: Record<string, unknown>[]): Promise<{
  ok: boolean;
  retryTokens: string[];
}> {
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  });

  const text = await res.text().catch(() => '');
  if (!res.ok) {
    console.error('Expo push HTTP failed:', res.status, text.slice(0, 400));
    return {
      ok: false,
      retryTokens: messages
        .map((m) => m.to)
        .filter((t): t is string => typeof t === 'string'),
    };
  }

  let parsed: { data?: ExpoTicket[] } = {};
  try {
    parsed = JSON.parse(text) as { data?: ExpoTicket[] };
  } catch {
    console.error('Expo push bad JSON:', text.slice(0, 200));
    return { ok: false, retryTokens: [] };
  }

  const tickets = parsed.data ?? [];
  const dead: string[] = [];
  const retryTokens: string[] = [];

  tickets.forEach((ticket, index) => {
    const token = messages[index]?.to;
    if (typeof token !== 'string') return;
    if (ticket.status === 'ok') return;

    const code = ticket.details?.error ?? '';
    console.error('Expo push ticket error:', code || ticket.message, token.slice(0, 28));

    if (code === 'DeviceNotRegistered') {
      dead.push(token);
      return;
    }
    // Geçici Expo / rate limit hatalarında bir kez daha dene
    if (
      code === 'ExpoError' ||
      code === 'MessageRateExceeded' ||
      code === 'ProviderError' ||
      !code
    ) {
      retryTokens.push(token);
    }
  });

  if (dead.length > 0) {
    await deactivateTokens(dead);
  }

  return { ok: retryTokens.length === 0 && dead.length === 0, retryTokens };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const RETRY_DELAYS_MS = [0, 600, 1800];

async function sendWithRetries(messages: Record<string, unknown>[]): Promise<void> {
  if (messages.length === 0) return;

  let pending = messages;
  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt]!);

    const nextPending: Record<string, unknown>[] = [];
    for (let i = 0; i < pending.length; i += 100) {
      const chunk = pending.slice(i, i + 100);
      const result = await sendExpoPush(chunk);
      if (result.retryTokens.length > 0) {
        const retrySet = new Set(result.retryTokens);
        nextPending.push(...chunk.filter((m) => typeof m.to === 'string' && retrySet.has(m.to)));
      }
    }

    if (nextPending.length === 0) return;
    pending = nextPending;
  }

  console.error('notifyManagersNewOrder: push failed after retries', pending.length);
}

/** Never throws to callers. Retries once on transient Expo failures. */
export async function notifyManagersNewOrder(payload: NewOrderPushPayload): Promise<void> {
  try {
    const supabase = tryCreateServiceClient();
    if (!supabase) {
      console.warn('notifyManagersNewOrder: no service client');
      return;
    }

    const { data: devices, error } = await supabase
      .from('admin_device_tokens')
      .select('expo_push_token')
      .eq('is_active', true);

    if (error) {
      console.error('notifyManagersNewOrder list tokens:', error.message);
      return;
    }

    const tokens = [
      ...new Set(
        (devices ?? [])
          .map((d) => d.expo_push_token)
          .filter((t): t is string => typeof t === 'string' && isExpoPushToken(t))
      ),
    ];

    if (tokens.length === 0) {
      console.warn('notifyManagersNewOrder: no active device tokens');
      return;
    }

    const note = buildNotification(payload);
    const messages = tokens.map((to) => ({ to, ...note }));

    await sendWithRetries(messages);
    console.info('notifyManagersNewOrder sent', payload.orderNumber, 'devices=', tokens.length);
  } catch (err) {
    console.error('notifyManagersNewOrder threw:', err);
  }
}
