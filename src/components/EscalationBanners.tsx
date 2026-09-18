import { AlertOctagon, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Alert } from '../types';
import { Button } from './ui/Button';
import { formatTimestamp } from '../utils/formatting';

const TONES = {
  critical: {
    wrapper: 'border-black bg-neutral-100 text-black',
    label: 'Critical',
  },
  warning: {
    wrapper: 'border-black bg-neutral-100 text-black',
    label: 'Warning',
  },
  info: {
    wrapper: 'border-black bg-neutral-100 text-black',
    label: 'For information',
  },
} as const;

function SeverityIcon({ severity }: { severity: Alert['severity'] }) {
  if (severity === 'critical') {
    return (
      <AlertOctagon
        aria-hidden="true"
        size={30}
        className="mt-0.5 shrink-0"
      />
    );
  }

  if (severity === 'warning') {
    return (
      <AlertTriangle
        aria-hidden="true"
        size={30}
        className="mt-0.5 shrink-0"
      />
    );
  }

  return (
    <CheckCircle
      aria-hidden="true"
      size={30}
      className="mt-0.5 shrink-0"
    />
  );
}

export function EscalationBanners({
  alerts,
  onAcknowledge,
}: {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}) {
  const open = alerts.filter((alert) => !alert.acknowledged);

  if (open.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border-2 border-black bg-neutral-100 p-5 text-black">
        <CheckCircle
          aria-hidden="true"
          size={30}
          className="mt-0.5 shrink-0"
        />

        <div>
          <p className="text-lg font-bold">For information</p>
          <p className="text-lg">
            All scheduled medicines are confirmed, and nothing needs your attention.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-4"
      role="region"
      aria-label="Escalation alerts"
    >
      {open.map((alert) => (
        <div
          key={alert.id}
          className={`flex flex-wrap items-start gap-4 rounded-2xl border-2 p-5 ${
            TONES[alert.severity].wrapper
          }`}
        >
          <SeverityIcon severity={alert.severity} />

          <div className="min-w-[14rem] flex-1">
            <p className="text-lg font-bold">
              {TONES[alert.severity].label}
            </p>

            <p className="text-lg">{alert.message}</p>

            <p className="mt-1 text-base opacity-80">
              Raised {formatTimestamp(alert.createdAt)}
            </p>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAcknowledge(alert.id)}
          >
            Acknowledge
          </Button>
        </div>
      ))}
    </div>
  );
}

