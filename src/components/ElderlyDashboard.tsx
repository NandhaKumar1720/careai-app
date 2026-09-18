import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Bell,
  CalendarCheck,
  CheckCircle,
  Clock,
  Mic,
  Pill,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { Card, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { MedicineCard } from './MedicineCard';
import { ReminderModal } from './ReminderModal';
import { CaretakerConnectCard } from './profile/CaretakerConnectCard';
import { useApp } from '../hooks/useApp';
import { useToast } from '../hooks/useToast';
import { useNow } from '../hooks/useNow';
import { dueMedicine, nextMedicine } from '../lib/medication';
import {
  groupMedicinesByTimeOfDay,
  getMinutesUntilDue,
  isReminderActive,
} from '../utils/date';
import { formatTime12, greetingForHour } from '../utils/formatting';

const GROUP_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
} as const;

export function ElderlyDashboard({ onOpenChat }: { onOpenChat: () => void }) {
  const { currentUser, medicinesFor, markMedicineStatus, caretakerForElder } = useApp();
  const { notify } = useToast();
  const now = useNow();
  const [dismissedReminderId, setDismissedReminderId] = useState<string | null>(null);

  const medicines = useMemo(
    () => (currentUser ? medicinesFor(currentUser.id) : []),
    [currentUser, medicinesFor],
  );

  if (!currentUser) return null;

  const active = medicines.filter((medicine) => medicine.status !== 'disabled');
  const taken = active.filter((medicine) => medicine.status === 'taken').length;
  const remaining = active.filter((medicine) => medicine.status === 'scheduled').length;
  const next = nextMedicine(active, now);
  const due = dueMedicine(active, now);
  const caretaker = caretakerForElder(currentUser.id);
  const groups = groupMedicinesByTimeOfDay(active);

  async function handleMark(id: string, status: 'taken' | 'not_taken') {
    const result = await markMedicineStatus(id, status);

    if (!result.ok) {
      notify('error', 'Could not save that', result.error, true);
      return;
    }

    if (status === 'taken') {
      notify('success', 'Marked as taken', 'Well done. Your caretaker can see this.');
    } else {
      notify(
        'warning',
        'Marked as not yet',
        'CareAI will keep this reminder open until the hour is up.',
        true,
      );
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-black sm:text-4xl">
          {greetingForHour(now.getHours())}, {currentUser.fullName.split(' ')[0]}
        </h1>

        <p className="mt-2 text-xl text-neutral-700">
          {remaining === 0
            ? 'Everything on today’s list has an answer. Nothing left to do.'
            : `${remaining} medicine${remaining === 1 ? '' : 's'} still to confirm today.`}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          label="Still to take"
          value={String(remaining)}
          icon={<Pill aria-hidden="true" size={26} />}
        />

        <SummaryTile
          label="Taken today"
          value={String(taken)}
          icon={<CheckCircle aria-hidden="true" size={26} />}
        />

        <SummaryTile
          label="Next medicine"
          value={next ? formatTime12(next.time) : 'None left'}
          icon={<Clock aria-hidden="true" size={26} />}
        />

        <SummaryTile
          label="Caretaker"
          value={caretaker ? caretaker.fullName.split(' ')[0] : 'Not connected'}
          icon={
            caretaker ? (
              <UserCheck aria-hidden="true" size={26} />
            ) : (
              <UserPlus aria-hidden="true" size={26} />
            )
          }
        />
      </div>

      {next ? (
        <Card className="border-black bg-black text-white">
          <p className="text-xl text-neutral-300">
            {isReminderActive(next.time, now) ? 'Due now' : 'Coming up next'}
          </p>

          <p className="mt-3 text-4xl font-bold sm:text-5xl">
            {next.name}
          </p>

          <p className="mt-2 text-2xl text-neutral-300">
            {next.dose} at {formatTime12(next.time)}
          </p>

          <p aria-live="polite" className="mt-4 text-xl text-neutral-300">
            {isReminderActive(next.time, now)
              ? 'Tap “Taken” once you have taken it.'
              : `In about ${Math.max(0, getMinutesUntilDue(next.time, now))} minutes.`}
          </p>

          {isReminderActive(next.time, now) ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Button
                size="lg"
                variant="success"
                onClick={() => void handleMark(next.id, 'taken')}
                icon={<CheckCircle aria-hidden="true" size={28} />}
              >
                Taken
              </Button>

              <Button
                size="lg"
                variant="warning"
                onClick={() => void handleMark(next.id, 'not_taken')}
                icon={<Clock aria-hidden="true" size={28} />}
              >
                Not yet
              </Button>
            </div>
          ) : null}
        </Card>
      ) : null}

      <Button
        size="lg"
        variant="secondary"
        fullWidth
        onClick={onOpenChat}
        icon={<Mic aria-hidden="true" size={28} />}
      >
        Talk to CareAI about today
      </Button>

      {active.length === 0 ? (
        <EmptyState
          icon={<Pill size={48} />}
          title="No medicines on your schedule yet"
          description={
            caretaker
              ? `Ask ${caretaker.fullName} to add your medicines. They will appear here straight away.`
              : 'Connect to your caretaker below, and they can add your medicines for you.'
          }
        />
      ) : (
        (Object.keys(GROUP_LABELS) as Array<keyof typeof GROUP_LABELS>).map((key) =>
          groups[key].length ? (
            <Card key={key}>
              <CardHeader
                title={GROUP_LABELS[key]}
                description={`${groups[key].length} medicine${
                  groups[key].length === 1 ? '' : 's'
                }`}
                icon={<CalendarCheck aria-hidden="true" size={28} />}
              />

              <div className="space-y-5">
                {groups[key].map((medicine) => (
                  <MedicineCard
                    key={medicine.id}
                    medicine={medicine}
                    now={now}
                    onMark={(id, status) => void handleMark(id, status)}
                  />
                ))}
              </div>
            </Card>
          ) : null,
        )
      )}

      {!caretaker ? <CaretakerConnectCard /> : null}

      <ReminderModal
        medicine={due}
        now={now}
        open={Boolean(due) && due?.id !== dismissedReminderId}
        onMark={(id, status) => {
          setDismissedReminderId(id);
          void handleMark(id, status);
        }}
        onDismiss={() => setDismissedReminderId(due ? due.id : null)}
      />
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-sm">
      <p className="flex items-center gap-2 text-lg text-neutral-700">
        <span aria-hidden="true" className="text-black">
          {icon}
        </span>
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-black sm:text-4xl">
        {value}
      </p>
    </div>
  );
}
