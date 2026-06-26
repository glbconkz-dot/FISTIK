'use client';

interface AdminActionModalProps {
  open: boolean;
  title: string;
  description?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  pending?: boolean;
  inputType?: 'time' | 'text' | 'textarea';
  placeholder?: string;
}

export function AdminActionModal({
  open,
  title,
  description,
  label,
  value,
  onChange,
  onClose,
  onSubmit,
  submitLabel,
  pending = false,
  inputType = 'text',
  placeholder,
}: AdminActionModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div
        className="luxury-card w-full max-w-md p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <h4 id="admin-modal-title" className="font-display text-lg font-bold">
          {title}
        </h4>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}

        <label className="mt-4 block text-sm font-medium">{label}</label>
        {inputType === 'textarea' ? (
          <textarea
            className="input-field mt-1.5 min-h-[88px] resize-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
        ) : inputType === 'time' ? (
          <input
            className="input-field mt-1.5 tabular-nums"
            type="text"
            inputMode="numeric"
            placeholder="14:30"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
        ) : (
          <input
            className="input-field mt-1.5"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus
          />
        )}

        <p className="mt-1.5 text-xs text-muted">
          {inputType === 'time' ? '24 saat formatı: 14:30' : null}
        </p>

        <div className="mt-5 flex gap-2">
          <button type="button" className="btn-outline flex-1" onClick={onClose} disabled={pending}>
            Vazgeç
          </button>
          <button type="button" className="btn-primary flex-1" onClick={onSubmit} disabled={pending}>
            {pending ? 'Kaydediliyor...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
