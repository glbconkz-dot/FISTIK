import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

const styles: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-amber-100 text-amber-800',
  shipped: 'bg-sky-100 text-sky-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const labels: Record<OrderStatus, string> = {
  new: 'Yeni',
  confirmed: 'Sevkiyat bekliyor',
  shipped: 'Sevkiyata verildi',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}
