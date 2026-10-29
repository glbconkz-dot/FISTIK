'use client';

import { normalizeTime24Input } from '@/lib/b2c/clearance';
import { cn } from '@/lib/utils';

interface TimeInput24Props {
  value: string;
  onChange: (value: string) => void;
  onBlurCommit?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
}

/** 24 saat formatı — tarayıcı AM/PM göstermez (örn. 16:00, 20:30). */
export function TimeInput24({
  value,
  onChange,
  onBlurCommit,
  className,
  disabled,
  id,
}: TimeInput24Props) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      disabled={disabled}
      placeholder="16:00"
      maxLength={5}
      className={cn('input-field font-mono tabular-nums', className)}
      value={value}
      onChange={(e) => {
        let next = e.target.value.replace(/[^\d:]/g, '');
        if (next.length === 2 && !next.includes(':') && value.length < 2) {
          next = `${next}:`;
        }
        if (next.length > 5) next = next.slice(0, 5);
        onChange(next);
      }}
      onBlur={() => {
        const normalized = normalizeTime24Input(value);
        if (normalized) {
          onChange(normalized);
          onBlurCommit?.(normalized);
        }
      }}
    />
  );
}
