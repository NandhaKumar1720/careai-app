import { ChevronRight, Pill, Plus } from 'lucide-react';
import type { ElderSummary } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ProfileAvatar } from './profile/ProfileAvatar';
import { ProgressBar, adherenceTone } from './ui/ProgressBar';
import { formatPercent } from '../utils/formatting';

export function ElderSummaryCard({
  summary,
  avatarUrl,
  selected,
  onSelect,
  onAddMedicine,
}: {
  summary: ElderSummary;
  avatarUrl: string | null;
  selected: boolean;
  onSelect: () => void;
  onAddMedicine: () => void;
}) {
  const { elder, taken, missed, pending, total, adherence, openAlerts } = summary;

  return (
    <article
      className={`rounded-2xl border-2 p-6 shadow-sm ${
        selected ? 'border-black bg-white' : 'border-neutral-200 bg-white'
      }`}
      aria-label={`${elder.fullName}, adherence ${formatPercent(adherence)}, ${total} medicines today`}
    >
      <div className="flex flex-wrap items-start gap-4">
        <ProfileAvatar name={elder.fullName} dataUrl={avatarUrl} size="lg" />

        <div className="min-w-0 flex-1">
          <h3 className="text-2xl font-bold text-black">{elder.fullName}</h3>

          <p className="text-lg text-neutral-700">@{elder.username}</p>

          {elder.age ? (
            <p className="text-lg text-neutral-700">Age {elder.age}</p>
          ) : null}

          <p className="mt-2">
            <Badge tone="success">Connected</Badge>
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-4xl font-bold text-black">
            {formatPercent(adherence)}
          </p>

          <p className="text-lg text-neutral-700">
            adherence today
          </p>
        </div>

        <div className="mt-3">
          <ProgressBar
            value={adherence}
            label={`Adherence for ${elder.fullName}`}
            tone={adherenceTone(adherence)}
          />
        </div>

        <p className="mt-3 text-lg text-neutral-700">
          {taken} taken, {missed} missed, {pending} pending, {total} scheduled today.
        </p>
      </div>

      {openAlerts.length ? (
        <p className="mt-4 rounded-2xl border-2 border-black bg-neutral-100 p-4 text-lg font-semibold text-black">
          {openAlerts.length} alert{openAlerts.length === 1 ? '' : 's'} need your attention.
        </p>
      ) : (
        <p className="mt-4 text-lg text-neutral-700">
          No open alerts.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          size="sm"
          onClick={onSelect}
          icon={<ChevronRight aria-hidden="true" size={20} />}
        >
          {selected ? 'Viewing details' : 'View details'}
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={onAddMedicine}
          icon={<Plus aria-hidden="true" size={20} />}
        >
          Add medicine
        </Button>

        <span className="inline-flex items-center gap-2 text-lg text-neutral-700">
          <Pill aria-hidden="true" size={20} />
          {total} today
        </span>
      </div>
    </article>
  );
}

