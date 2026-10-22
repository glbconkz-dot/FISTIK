import { after } from 'next/server';
import type { NewOrderPushPayload } from '@/lib/manager-push';

async function runNotify(payload: NewOrderPushPayload): Promise<void> {
  try {
    const { notifyManagersNewOrder } = await import('@/lib/manager-push');
    await notifyManagersNewOrder(payload);
  } catch (err) {
    console.error('scheduleManagerOrderPush failed:', err);
  }
}

/**
 * Sipariş yanıtı kullanıcıya gittikten sonra push gönder.
 * `after()` Vercel'de request bitince çalışır; yoksa fire-and-forget yedek.
 */
export function scheduleManagerOrderPush(payload: NewOrderPushPayload): void {
  try {
    after(() => runNotify(payload));
  } catch (err) {
    console.warn('after() unavailable, inline push', err);
    void runNotify(payload);
  }
}
