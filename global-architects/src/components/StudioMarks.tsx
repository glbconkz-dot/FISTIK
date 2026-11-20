import type { DepartmentId, SectionStatus, StageId } from '@/data/studio';
import { PIPELINE_ORDER } from '@/data/studio';

export function GateStamp({
  open,
  openLabel,
  closedLabel,
}: {
  open: boolean;
  openLabel: string;
  closedLabel: string;
}) {
  return (
    <span className={`stamp px-2 py-1 ${open ? 'stamp-open' : 'stamp-closed'}`}>
      {open ? openLabel : closedLabel}
    </span>
  );
}

export function StageStamp({ label }: { label: string }) {
  return <span className="stamp px-2 py-1">{label}</span>;
}

const STATUS_CLASS: Record<SectionStatus, string> = {
  missing: 'text-muted',
  draft: 'text-bronze',
  internal_review: 'blueprint',
  ready: 'ready',
  comments: 'text-stamp',
  approved: 'ready',
};

export function StatusMark({
  status,
  label,
}: {
  status: SectionStatus;
  label: string;
}) {
  return <span className={`label ${STATUS_CLASS[status]}`}>{label}</span>;
}

export function StageRail({
  current,
  labels,
}: {
  current: StageId;
  labels: Record<StageId, string>;
}) {
  const currentIndex = PIPELINE_ORDER.indexOf(current);
  return (
    <ol className="grid gap-3 sm:grid-cols-6">
      {PIPELINE_ORDER.map((stage, index) => {
        const reached = currentIndex >= index;
        return (
          <li
            key={stage}
            className={`border-t pt-3 ${reached ? 'border-charcoal' : 'border-rule'}`}
          >
            <p className="label">{String(index + 1).padStart(2, '0')}</p>
            <p className={`mt-2 text-sm leading-tight ${reached ? 'text-charcoal' : 'text-muted'}`}>
              {labels[stage]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function OwnerCode({
  owner,
  label,
}: {
  owner: DepartmentId;
  label: string;
}) {
  return (
    <span className="label text-muted" title={owner}>
      {label}
    </span>
  );
}
