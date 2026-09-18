import { CheckCircle, Clock, Pill } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import type { Medicine } from '../types';
import { formatTime12 } from '../utils/formatting';
import { getMinutesUntilExpiry } from '../utils/date';

export function ReminderModal({
  medicine,
  now,
  open,
  onMark,
  onDismiss,
}: {
  medicine: Medicine | null;
  now: Date;
  open: boolean;
  onMark: (id: string, status: 'taken' | 'not_taken') => void;
  onDismiss: () => void;
}) {
  if (!medicine) return null;

  return (
    <Modal
      open={open}
      onClose={onDismiss}
      title="Time for your medicine"
      description={`Scheduled for ${formatTime12(medicine.time)}.`}
      size="md"
    >
      <div className="text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-black text-white"
        >
          <Pill size={48} />
        </span>

        <p className="mt-6 text-4xl font-bold text-black">
          {medicine.name}
        </p>

        <p className="mt-2 text-3xl text-neutral-700">
          {medicine.dose}
        </p>

        {medicine.notes ? (
          <p className="mt-4 text-xl text-neutral-700">
            {medicine.notes}
          </p>
        ) : null}

        <p
          aria-live="polite"
          className="mt-6 text-xl font-semibold text-black"
        >
          {getMinutesUntilExpiry(medicine.time, now)} minutes left to answer.
        </p>
      </div>

      <div className="space-y-4">
        <Button
          size="lg"
          variant="success"
          fullWidth
          onClick={() => onMark(medicine.id, 'taken')}
          icon={<CheckCircle aria-hidden="true" size={30} />}
        >
          Taken
        </Button>

        <Button
          size="lg"
          variant="warning"
          fullWidth
          onClick={() => onMark(medicine.id, 'not_taken')}
          icon={<Clock aria-hidden="true" size={30} />}
        >
          Not yet
        </Button>

        <Button
          size="md"
          variant="ghost"
          fullWidth
          onClick={onDismiss}
        >
          Remind me on the dashboard
        </Button>
      </div>
    </Modal>
  );
}
