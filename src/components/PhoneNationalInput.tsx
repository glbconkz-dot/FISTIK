'use client';

import { useRef } from 'react';
import {
  extractKzNationalDigits,
  formatKzNationalDisplay,
} from '@/lib/checkout';

interface PhoneNationalInputProps {
  value: string;
  onChange: (digits: string) => void;
  onBlur: () => void;
  name: string;
  placeholder?: string;
}

export function PhoneNationalInput({
  value,
  onChange,
  onBlur,
  name,
  placeholder,
}: PhoneNationalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (raw: string) => {
    onChange(extractKzNationalDigits(raw));
  };

  return (
    <div className="phone-field">
      <span className="phone-field-prefix" aria-hidden="true">
        +7
      </span>
      <input
        ref={inputRef}
        className="phone-field-input tabular-nums"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        name={name}
        placeholder={placeholder}
        value={formatKzNationalDisplay(value)}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={onBlur}
      />
      {value.length > 0 && (
        <button
          type="button"
          className="phone-field-clear"
          aria-label="Clear phone number"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
