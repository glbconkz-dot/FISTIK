'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import type { AppLocale } from '@/i18n/routing';
import { openWhatsAppWithMessage } from '@/lib/open-whatsapp';
import { STUDIO } from '@/lib/studio';
import { buildBriefWhatsAppMessage } from '@/lib/whatsapp';

const schema = z.object({
  name: z.string().trim().min(2),
  company: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  email: z.string().trim().email(),
  projectType: z.string().min(1),
  location: z.string().trim().min(2),
  area: z.string().trim().optional(),
  stage: z.string().min(1),
  notes: z.string().trim().min(8),
});

type Values = z.infer<typeof schema>;

type Props = {
  locale: AppLocale;
};

export function BriefForm({ locale }: Props) {
  const t = useTranslations('brief');
  const [submitted, setSubmitted] = useState<Values | null>(null);
  const [error, setError] = useState<string | null>(null);

  const typeOptions = useMemo(
    () => [
      { value: 'architecture', label: t('types.architecture') },
      { value: 'industrial', label: t('types.industrial') },
      { value: 'healthcare', label: t('types.healthcare') },
      { value: 'residential', label: t('types.residential') },
      { value: 'interiors', label: t('types.interiors') },
      { value: 'masterplan', label: t('types.masterplan') },
      { value: 'construction', label: t('types.construction') },
    ],
    [t],
  );

  const stageOptions = useMemo(
    () => [
      { value: 'concept', label: t('stages.concept') },
      { value: 'draft', label: t('stages.draft') },
      { value: 'working', label: t('stages.working') },
      { value: 'expertise', label: t('stages.expertise') },
      { value: 'construction', label: t('stages.construction') },
    ],
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      company: '',
      phone: '',
      email: '',
      projectType: 'architecture',
      location: '',
      area: '',
      stage: 'concept',
      notes: '',
    },
  });

  const onSubmit = (data: Values) => {
    setError(null);
    const typeLabel = typeOptions.find((option) => option.value === data.projectType)?.label ?? data.projectType;
    const stageLabel = stageOptions.find((option) => option.value === data.stage)?.label ?? data.stage;
    const message = buildBriefWhatsAppMessage({
      name: data.name,
      company: data.company,
      phone: data.phone,
      email: data.email,
      projectType: typeLabel,
      location: data.location,
      area: data.area ?? '',
      stage: stageLabel,
      notes: data.notes,
      locale,
    });
    openWhatsAppWithMessage(message);
    setSubmitted(data);
    reset();
  };

  if (submitted) {
    return (
      <div className="border border-rule bg-surface p-6 sm:p-8" role="status">
        <p className="label">{t('sentLabel')}</p>
        <h2 className="mt-3 font-display text-4xl leading-none">{t('sentTitle')}</h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{t('sentBody', { phone: STUDIO.phoneDisplay })}</p>
        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="label">{t('name')}</dt>
            <dd className="mt-1">{submitted.name}</dd>
          </div>
          <div>
            <dt className="label">{t('company')}</dt>
            <dd className="mt-1">{submitted.company}</dd>
          </div>
          <div>
            <dt className="label">{t('phone')}</dt>
            <dd className="mt-1">{submitted.phone}</dd>
          </div>
          <div>
            <dt className="label">{t('email')}</dt>
            <dd className="mt-1">{submitted.email}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="label">{t('notes')}</dt>
            <dd className="mt-1 whitespace-pre-wrap">{submitted.notes}</dd>
          </div>
        </dl>
        <button
          type="button"
          className="mt-8 border border-charcoal px-5 py-3 text-sm tracking-wide"
          onClick={() => setSubmitted(null)}
        >
          {t('another')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, () => setError(t('invalid')))} className="border border-rule bg-surface p-6 sm:p-8">
      <p className="label">{t('kicker')}</p>
      <h2 className="mt-3 font-display text-4xl leading-none">{t('title')}</h2>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{t('intro')}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Field label={t('name')} error={errors.name ? t('required') : undefined}>
          <input {...register('name')} autoComplete="name" className="field-input" />
        </Field>
        <Field label={t('company')} error={errors.company ? t('required') : undefined}>
          <input {...register('company')} autoComplete="organization" className="field-input" />
        </Field>
        <Field label={t('phone')} error={errors.phone ? t('required') : undefined}>
          <input {...register('phone')} autoComplete="tel" inputMode="tel" className="field-input" />
        </Field>
        <Field label={t('email')} error={errors.email ? t('emailError') : undefined}>
          <input {...register('email')} autoComplete="email" type="email" className="field-input" />
        </Field>
        <Field label={t('type')}>
          <select {...register('projectType')} className="field-input">
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('stage')}>
          <select {...register('stage')} className="field-input">
            {stageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('location')} error={errors.location ? t('required') : undefined}>
          <input {...register('location')} className="field-input" />
        </Field>
        <Field label={t('area')}>
          <input {...register('area')} className="field-input" />
        </Field>
        <Field label={t('notes')} error={errors.notes ? t('notesError') : undefined} className="sm:col-span-2">
          <textarea {...register('notes')} rows={6} className="field-input min-h-[8rem] resize-y" />
        </Field>
      </div>

      {error ? <p className="mt-4 text-sm text-bronze">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 bg-charcoal px-6 py-3 text-sm tracking-[0.16em] text-paper uppercase disabled:opacity-60"
      >
        {t('submit')}
      </button>
      <p className="mt-3 text-xs leading-relaxed text-muted">{t('hint', { phone: STUDIO.phoneDisplay })}</p>
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="label">{label}</span>
      <span className="mt-2 block border-b border-rule focus-within:border-charcoal">{children}</span>
      {error ? <span className="mt-1 block text-xs text-bronze">{error}</span> : null}
    </label>
  );
}
