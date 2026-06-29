'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  compact?: boolean;
  editable?: boolean;
  min?: number;
  max?: number;
}

export function QuantitySelector({
  value,
  onChange,
  label,
  compact = false,
  editable = false,
  min = 1,
  max,
}: QuantitySelectorProps) {
  const btnClass = compact
    ? 'flex min-h-[36px] min-w-[36px] items-center justify-center touch-manipulation'
    : 'flex min-h-[44px] min-w-[44px] items-center justify-center touch-manipulation';

  const clamp = (next: number) => {
    let v = Math.max(min, next);
    if (max != null) v = Math.min(max, v);
    return v;
  };

  const handleInputChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      onChange(min);
      return;
    }
    onChange(clamp(Number.parseInt(digits, 10)));
  };

  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {label ? <span className="text-sm text-muted">{label}</span> : null}
      <div
        className={cn(
          'flex items-center rounded-full border border-border bg-surface',
          compact && 'shrink-0'
        )}
      >
        <button
          type="button"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          className={cn(btnClass, 'disabled:opacity-40')}
          aria-label="Decrease quantity"
        >
          <Minus className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </button>
        {editable ? (
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={String(value)}
            onChange={(e) => handleInputChange(e.target.value)}
            className={cn(
              'w-9 border-0 bg-transparent text-center font-semibold tabular-nums outline-none',
              compact ? 'text-sm' : 'text-base'
            )}
            aria-label="Quantity"
          />
        ) : (
          <span
            className={cn(
              'min-w-[1.75rem] text-center font-semibold tabular-nums',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {value}
          </span>
        )}
        <button
          type="button"
          onClick={() => onChange(clamp(value + 1))}
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
