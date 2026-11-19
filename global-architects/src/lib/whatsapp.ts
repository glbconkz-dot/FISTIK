import type { AppLocale } from '@/i18n/routing';
import { STUDIO } from '@/lib/studio';

export type BriefPayload = {
  name: string;
  company: string;
  phone: string;
  email: string;
  projectType: string;
  location: string;
  area: string;
  stage: string;
  notes: string;
  locale: AppLocale;
};

const labels: Record<
  AppLocale,
  {
    title: string;
    name: string;
    company: string;
    phone: string;
    email: string;
    type: string;
    location: string;
    area: string;
    stage: string;
    notes: string;
  }
> = {
  ru: {
    title: 'KA Global Architects — бриф проекта',
    name: 'Имя',
    company: 'Компания',
    phone: 'Телефон',
    email: 'Эл. почта',
    type: 'Тип проекта',
    location: 'Площадка',
    area: 'Площадь',
    stage: 'Стадия',
    notes: 'Описание',
  },
  en: {
    title: 'KA Global Architects — project brief',
    name: 'Name',
    company: 'Company',
    phone: 'Phone',
    email: 'Email',
    type: 'Project type',
    location: 'Site',
    area: 'Area',
    stage: 'Stage',
    notes: 'Notes',
  },
  tr: {
    title: 'KA Global Architects — proje brifi',
    name: 'Ad',
    company: 'Şirket',
    phone: 'Telefon',
    email: 'E-posta',
    type: 'Proje türü',
    location: 'Yer',
    area: 'Alan',
    stage: 'Aşama',
    notes: 'Notlar',
  },
  kk: {
    title: 'KA Global Architects — жоба брифі',
    name: 'Аты',
    company: 'Компания',
    phone: 'Телефон',
    email: 'Эл. пошта',
    type: 'Жоба түрі',
    location: 'Алаң',
    area: 'Алаңы',
    stage: 'Кезең',
    notes: 'Сипаттама',
  },
};

function field(label: string, value: string): string | null {
  const v = value.trim();
  return v ? `${label}: ${v}` : null;
}

export function buildBriefWhatsAppMessage(payload: BriefPayload): string {
  const l = labels[payload.locale];
  const contact = [
    `*${l.title}*`,
    field(l.name, payload.name),
    field(l.company, payload.company),
    field(l.phone, payload.phone),
    field(l.email, payload.email),
  ]
    .filter(Boolean)
    .join('\n');

  const project = [
    field(l.type, payload.projectType),
    field(l.location, payload.location),
    field(l.area, payload.area),
    field(l.stage, payload.stage),
  ]
    .filter(Boolean)
    .join('\n');

  const blocks = [contact, project];
  if (payload.notes.trim()) {
    blocks.push(`*${l.notes}*\n${payload.notes.trim()}`);
  }
  return blocks.join('\n\n');
}

export function buildWhatsAppWaMeUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${phone}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppAppUrl(phone: string, message?: string): string {
  const base = `whatsapp://send?phone=${phone}`;
  if (!message) return base;
  return `${base}&text=${encodeURIComponent(message)}`;
}

export function getStudioWhatsAppLink(message?: string): string {
  return buildWhatsAppWaMeUrl(STUDIO.phoneWhatsApp, message);
}
