'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  compact?: boolean;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  value,
  onChange,
  label,
  compact = false,
  min = 1,
  max,
}: QuantitySelectorProps) {
  const btnClass = compact
    ? 'flex min-h-[36px] min-w-[36px] items-center justify-center'
    : 'flex min-h-[44px] min-w-[44px] items-center justify-center';

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-sm text-muted">{label}</span>}
      <div
        className={cn(
          'flex items-center rounded-full border border-border bg-surface',
          compact && 'shrink-0'
        )}
      >
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          className={cn(btnClass, 'disabled:opacity-40')}
          aria-label="Decrease quantity"
        >
          <Minus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </button>
        <span
          className={cn(
            'min-w-[1.75rem] text-center font-semibold tabular-nums',
            compact ? 'text-sm' : 'text-base'
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(max != null ? Math.min(max, value + 1) : value + 1)}
          disabled={max != null && value >= max}
          className={cn(btnClass, 'disabled:opacity-40')}
          aria-label="Increase quantity"
        >
          <Plus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </button>
      </div>
    </div>
  );
}
