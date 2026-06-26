'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import type { Order } from '@/types';
import { AdminActionModal } from '@/components/admin/AdminActionModal';
import { OrderStatusBadge } from '@/components/admin/OrderStatusBadge';
import { getCurrentAlmatyTimeValue, getCancelReason, getCustomerNotes } from '@/lib/order-admin';
import { formatOrderDateTime, formatDeliveryTimeLabel } from '@/lib/order-dates';
import { formatPrice } from '@/lib/utils';
import { performOrderAction } from '@/app/actions/orders';

interface OrderDetailPanelProps {
  order: Order;
  onOrderChange?: (order: Order) => void;
}

type ModalKind = 'confirm' | 'ship' | 'cancel' | null;

export function OrderDetailPanel({ order: initialOrder, onOrderChange }: OrderDetailPanelProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [modal, setModal] = useState<ModalKind>(null);
  const [timeValue, setTimeValue] = useState(getCurrentAlmatyTimeValue());
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const applyPatch = (patch: Partial<Order>) => {
    const next = { ...order, ...patch };
    setOrder(next);
    onOrderChange?.(next);
  };

  const runAction = (action: Parameters<typeof performOrderAction>[0]) => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await performOrderAction(action);

      if (!result.success) {
        const errors: Record<string, string> = {
          insufficientStock: 'Stok yetersiz — ürün adetlerini kontrol edin.',
          invalidDeliveryTime: 'Geçerli teslim saati girin (24 saat, örn. 14:30).',
          invalidShipTime: 'Geçerli sevkiyat saati girin (24 saat, örn. 15:00).',
          cancelReasonRequired: 'İptal nedeni en az 3 karakter olmalı.',
          mustShipFirst: 'Önce kuryeye teslim edin.',
          invalidTransition: 'Bu işlem bu aşamada yapılamaz.',
          runOrderMigration:
            'Supabase SQL gerekli: fix-order-workflow.sql dosyasını çalıştırın (shipped + saat sütunları).',
        };
        setError(errors[result.error ?? ''] ?? result.error ?? 'İşlem başarısız.');
        return;
      }

      if (result.order) applyPatch(result.order);
      setModal(null);
      setCancelReason('');
      if (result.migrationNeeded) {
        setNotice('Durum kaydedildi. Tam saat kaydı için fix-order-workflow.sql çalıştırın.');
      }
      router.refresh();
    });
  };

  const openModal = (kind: ModalKind) => {
    setTimeValue(getCurrentAlmatyTimeValue());
    setError(null);
    setModal(kind);
  };

  const items = Array.isArray(order.items) ? order.items : [];
  const savedCancelReason = getCancelReason(order);
  const customerNotes = getCustomerNotes(order);

  return (
    <>
      <div className="luxury-card space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold">#{order.order_number}</h3>
          <OrderStatusBadge status={order.status} />
        </div>

        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-muted">Sipariş saati</dt>
            <dd className="font-medium">{formatOrderDateTime(order.created_at)}</dd>
          </div>
          {order.confirmed_at ? (
            <div>
              <dt className="text-muted">Onay saati</dt>
              <dd className="font-medium">{formatOrderDateTime(order.confirmed_at)}</dd>
            </div>
          ) : null}
          {order.shipped_at ? (
            <div>
              <dt className="text-muted">Sevkiyat saati</dt>
              <dd className="font-medium">{formatOrderDateTime(order.shipped_at)}</dd>
            </div>
          ) : null}
          {order.completed_at ? (
            <div>
              <dt className="text-muted">Tamamlanma saati</dt>
              <dd className="font-medium">{formatOrderDateTime(order.completed_at)}</dd>
            </div>
          ) : null}
          {order.cancelled_at ? (
            <div>
              <dt className="text-muted">İptal saati</dt>
              <dd className="font-medium">{formatOrderDateTime(order.cancelled_at)}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted">Müşteri</dt>
            <dd className="font-medium">{order.customer_name}</dd>
          </div>
          <div>
            <dt className="text-muted">Telefon</dt>
            <dd>
              <a href={`tel:${order.phone}`} className="font-medium text-accent underline">
                {order.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Teslimat günü</dt>
            <dd className="font-medium">{order.delivery_date}</dd>
          </div>
          <div>
            <dt className="text-muted">Teslim saati</dt>
            <dd className="font-medium tabular-nums">{formatDeliveryTimeLabel(order.delivery_time)}</dd>
          </div>
          <div>
            <dt className="text-muted">Adres</dt>
            <dd>{order.address}</dd>
          </div>
          {order.cake_text ? (
            <div>
              <dt className="text-muted">Pasta yazısı</dt>
              <dd>{order.cake_text}</dd>
            </div>
          ) : null}
          {customerNotes ? (
            <div>
              <dt className="text-muted">Not</dt>
              <dd>{customerNotes}</dd>
            </div>
          ) : null}
          {savedCancelReason ? (
            <div>
              <dt className="text-muted">İptal nedeni</dt>
              <dd className="font-medium text-red-700">{savedCancelReason}</dd>
            </div>
          ) : null}
        </dl>

        <div>
          <p className="mb-2 text-sm font-medium">Ürünler</p>
          <ul className="space-y-1 text-sm">
            {items.map((item, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 font-semibold text-accent">Toplam: {formatPrice(Number(order.total))}</p>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-medium">İşlemler</p>

          {order.status === 'new' && (
            <>
              <p className="text-xs text-muted">
                Müşteriyi arayın. Onaylarken mutabık kalınan <strong>teslim saatini</strong> yazın.
              </p>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openModal('confirm')}
                className="btn-primary w-full py-3 text-base"
              >
                Siparişi onayla
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openModal('cancel')}
                className="btn-outline w-full border-red-300 text-red-700"
              >
                İptal et
              </button>
            </>
          )}

          {order.status === 'confirmed' && (
            <>
              <p className="text-xs text-muted">
                Ürün hazır — kuryeye verince sevkiyat saatini kaydedin.
              </p>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openModal('ship')}
                className="btn-primary w-full"
              >
                Kuryeye teslim edildi
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openModal('cancel')}
                className="btn-outline w-full border-red-300 text-red-700"
              >
                İptal et
              </button>
            </>
          )}

          {order.status === 'shipped' && (
            <>
              <p className="text-xs text-muted">
                Müşteriden teslim bilgisi gelince tamamlayın.
              </p>
              <button
                type="button"
                disabled={isPending}
                onClick={() => runAction({ orderId: order.id, action: 'complete' })}
                className="btn-primary w-full"
              >
                {isPending ? 'Kaydediliyor...' : 'Teslim edildi — Tamamla'}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => openModal('cancel')}
                className="btn-outline w-full border-red-300 text-red-700"
              >
                İptal et
              </button>
            </>
          )}

          {order.status === 'completed' && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
              Tamamlanan sipariş.
            </p>
          )}

        {order.status === 'cancelled' && (
          <div className="space-y-2">
            {savedCancelReason ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                <span className="font-semibold">İptal nedeni:</span> {savedCancelReason}
              </p>
            ) : (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                İptal edilmiş sipariş (neden kaydı yok).
              </p>
            )}
          </div>
        )}

          {notice ? <p className="text-sm text-amber-700">{notice}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </div>

      <AdminActionModal
        open={modal === 'confirm'}
        title="Siparişi onayla"
        description="Müşteriyle mutabık kalınan teslim saatini girin."
        label="Teslim saati"
        inputType="time"
        value={timeValue}
        onChange={setTimeValue}
        onClose={() => setModal(null)}
        onSubmit={() =>
          runAction({ orderId: order.id, action: 'confirm', deliveryTime: timeValue })
        }
        submitLabel="Onayla"
        pending={isPending}
      />

      <AdminActionModal
        open={modal === 'ship'}
        title="Kuryeye teslim"
        description="Kuryeye verdiğiniz saati kaydedin."
        label="Sevkiyat saati"
        inputType="time"
        value={timeValue}
        onChange={setTimeValue}
        onClose={() => setModal(null)}
        onSubmit={() => runAction({ orderId: order.id, action: 'ship', shipTime: timeValue })}
        submitLabel="Sevkiyata ver"
        pending={isPending}
      />

      <AdminActionModal
        open={modal === 'cancel'}
        title="Siparişi iptal et"
        description="Kısa iptal nedenini yazın."
        label="İptal nedeni"
        inputType="textarea"
        placeholder="Örn: Müşteri ulaşılamadı"
        value={cancelReason}
        onChange={setCancelReason}
        onClose={() => setModal(null)}
        onSubmit={() =>
          runAction({ orderId: order.id, action: 'cancel', reason: cancelReason })
        }
        submitLabel="İptali kaydet"
        pending={isPending}
      />
    </>
  );
}
