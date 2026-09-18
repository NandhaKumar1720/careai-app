import { CheckCircle, Clock, Pill, TimerOff } from 'lucide-react';
import type { Medicine } from '../types';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/Badge';
import { formatTime12, frequencyLabel } from '../utils/formatting';
import { describeMedicine } from '../utils/accessibility';
import { canRespondTo } from '../lib/medication';
import { getMinutesUntilExpiry, isReminderActive } from '../utils/date';

export function MedicineCard({
  medicine,
  now,
  onMark,
  readOnly = false,
}: {
  medicine: Medicine;
  now: Date;
  onMark?: (id: string, status: 'taken' | 'not_taken') => void;
  readOnly?: boolean;
}) {
  const respondable = canRespondTo(medicine, now);
  const active = isReminderActive(medicine.time, now);
  const expired = medicine.status === 'missed';

  return (
    <article
      aria-label={describeMedicine(
        medicine.name,
        medicine.dose,
        formatTime12(medicine.time),
        medicine.status,
      )}
      className={`rounded-2xl border-2 p-5 shadow-sm sm:p-6 ${
        expired
          ? 'border-black bg-neutral-100 opacity-80'
          : 'border-black bg-white'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              expired
                ? 'bg-neutral-200 text-black'
                : 'bg-black text-white'
            }`}
          >
            <Pill size={28} />
          </span>

          <div>
            <h3 className="text-2xl font-bold text-black">
              {medicine.name}
            </h3>

            <p className="text-xl text-neutral-700">
              {medicine.dose}
            </p>

            <p className="mt-1 text-lg text-neutral-700">
              {formatTime12(medicine.time)} — {frequencyLabel(medicine.frequency)}
            </p>

            {medicine.notes ? (
              <p className="mt-2 text-lg text-neutral-700">
                {medicine.notes}
              </p>
            ) : null}
          </div>
        </div>

        <StatusBadge status={medicine.status} />
      </div>

      {!readOnly && respondable && onMark ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Button
            size="lg"
            variant="success"
            onClick={() => onMark(medicine.id, 'taken')}
            icon={<CheckCircle aria-hidden="true" size={28} />}
            aria-label={`Mark ${medicine.name} as taken`}
          >
            Taken
          </Button>

          <Button
            size="lg"
            variant="warning"
            onClick={() => onMark(medicine.id, 'not_taken')}
            icon={<Clock aria-hidden="true" size={28} />}
            aria-label={`Mark ${medicine.name} as not taken yet`}
          >
            Not yet
          </Button>
        </div>
      ) : null}

      {!readOnly && respondable && active ? (
        <p className="mt-4 text-lg font-semibold text-black">
          {getMinutesUntilExpiry(medicine.time, now)} minutes left to answer this reminder.
        </p>
      ) : null}

      {expired ? (
        <p className="mt-4 flex items-center gap-2 text-lg font-semibold text-neutral-700">
          <TimerOff aria-hidden="true" size={22} />
          This reminder has expired. Tell your caretaker if you still need this dose.
        </p>
      ) : null}
    </article>
  );
}
