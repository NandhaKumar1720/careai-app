import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Clock, PauseCircle, XCircle } from 'lucide-react';
import type { MedicineStatus } from '../../types';
import { statusLabel } from '../../utils/formatting';

const TONES = {
  neutral: 'bg-slate-100 text-slate-800 border-slate-300',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-600',
  warning: 'bg-amber-50 text-amber-900 border-amber-600',
  danger: 'bg-red-50 text-red-800 border-red-600',
  info: 'bg-blue-50 text-blue-800 border-blue-600',
} as const;

export type BadgeTone = keyof typeof TONES;

export function Badge({
  tone = 'neutral',
  icon,
  children,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-base font-semibold ${TONES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}

/** Status is always icon + word, never colour alone. */
export function StatusBadge({ status }: { status: MedicineStatus }) {
  switch (status) {
    case 'taken':
      return (
        <Badge tone="success" icon={<CheckCircle aria-hidden="true" size={22} />}>
          {statusLabel(status)}
        </Badge>
      );
    case 'missed':
      return (
        <Badge tone="danger" icon={<AlertTriangle aria-hidden="true" size={22} />}>
          {statusLabel(status)}
        </Badge>
      );
    case 'not_taken':
      return (
        <Badge tone="warning" icon={<XCircle aria-hidden="true" size={22} />}>
          {statusLabel(status)}
        </Badge>
      );
    case 'disabled':
      return (
        <Badge tone="neutral" icon={<PauseCircle aria-hidden="true" size={22} />}>
          {statusLabel(status)}
        </Badge>
      );
    case 'scheduled':
    default:
      return (
        <Badge tone="info" icon={<Clock aria-hidden="true" size={22} />}>
          {statusLabel(status)}
        </Badge>
      );
  }
}
