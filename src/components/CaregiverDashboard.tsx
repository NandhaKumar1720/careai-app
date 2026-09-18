import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  Camera,
  Check,
  Copy,
  Pencil,
  Pill,
  Plus,
  Users,
} from 'lucide-react';
import { Card, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { StatusBadge } from './ui/Badge';
import { ProgressBar, adherenceTone } from './ui/ProgressBar';
import { ElderSummaryCard } from './ElderSummaryCard';
import { EscalationBanners } from './EscalationBanners';
import { AdherenceAuditTrail } from './AdherenceAuditTrail';
import { AddMedicineModal } from './AddMedicineModal';
import type { MedicineDraft } from './AddMedicineModal';
import { PrescriptionParseModal } from './PrescriptionParseModal';
import { useApp } from '../hooks/useApp';
import { useToast } from '../hooks/useToast';
import { MAX_ELDERS_PER_CARETAKER } from '../lib/caretakerCode';
import { formatPercent, formatTime12, frequencyLabel } from '../utils/formatting';
import type { Medicine } from '../types';

export function CaregiverDashboard() {
  const {
    currentUser,
    avatars,
    users,
    logs,
    alerts,
    summariesForCaretaker,
    acknowledgeAlert,
  } = useApp();
  const { notify } = useToast();

  const [selectedElderId, setSelectedElderId] = useState<string | null>(null);
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [draft, setDraft] = useState<MedicineDraft | null>(null);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const summaries = useMemo(
    () => (currentUser ? summariesForCaretaker(currentUser.id) : []),
    [currentUser, summariesForCaretaker],
  );

  if (!currentUser) return null;

  const elders = summaries.map((summary) => summary.elder);
  const elderIds = new Set(elders.map((elder) => elder.id));
  const teamLogs = logs.filter((log) => elderIds.has(log.elderId));
  const teamAlerts = alerts.filter((alert) => elderIds.has(alert.elderId));

  const totals = summaries.reduce(
    (acc, summary) => ({
      taken: acc.taken + summary.taken,
      missed: acc.missed + summary.missed,
      pending: acc.pending + summary.pending,
      total: acc.total + summary.total,
    }),
    { taken: 0, missed: 0, pending: 0, total: 0 },
  );

  const resolved = totals.taken + totals.missed;
  const adherence = resolved === 0 ? 100 : (totals.taken / resolved) * 100;
  const openAlerts = teamAlerts.filter((alert) => !alert.acknowledged).length;

  const selected = summaries.find((summary) => summary.elder.id === selectedElderId) ?? null;

  async function copyCode() {
    const code = currentUser?.caretakerCode;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 4000);
    } catch {
      notify('info', 'Copy the code by hand', code);
    }
  }

  function openAddMedicine(elderId?: string) {
    setEditingMedicine(null);
    setDraft(null);
    if (elderId) setSelectedElderId(elderId);
    setMedicineModalOpen(true);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black sm:text-4xl">
            Care overview
          </h1>

          <p className="mt-2 text-xl text-neutral-700">
            {elders.length === 0
              ? 'No elders are connected to you yet.'
              : `Monitoring ${elders.length} elder${elders.length === 1 ? '' : 's'} today.`}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            size="md"
            variant="secondary"
            onClick={() => setPrescriptionOpen(true)}
            icon={<Camera aria-hidden="true" size={22} />}
          >
            Parse prescription image
          </Button>

          <Button
            size="md"
            onClick={() => openAddMedicine()}
            disabled={elders.length === 0}
            icon={<Plus aria-hidden="true" size={22} />}
          >
            Add medicine
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Elders"
          value={String(elders.length)}
          icon={<Users aria-hidden="true" size={24} />}
        />

        <Metric
          label="Adherence"
          value={formatPercent(adherence)}
          icon={<Activity aria-hidden="true" size={24} />}
        />

        <Metric
          label="Doses today"
          value={String(totals.total)}
          icon={<Pill aria-hidden="true" size={24} />}
        />

        <Metric
          label="Missed doses"
          value={String(totals.missed)}
          icon={<AlertTriangle aria-hidden="true" size={24} />}
        />

        <Metric
          label="Open alerts"
          value={String(openAlerts)}
          icon={<AlertTriangle aria-hidden="true" size={24} />}
        />
      </div>

      <Card>
        <CardHeader
          title="Today's adherence"
          description={`${totals.taken} taken, ${totals.missed} missed, ${totals.pending} pending, ${totals.total} scheduled.`}
        />

        <ProgressBar
          value={adherence}
          label="Adherence across everyone you care for"
          tone={adherenceTone(adherence)}
        />
      </Card>

      <Card>
        <CardHeader
          title="Alerts"
          description="Acknowledge an alert once you have acted on it."
        />

        <EscalationBanners
          alerts={teamAlerts}
          onAcknowledge={(id) => void acknowledgeAlert(id)}
        />
      </Card>

      <Card>
        <CardHeader
          title="Your CareAI connection code"
          description={`Elders type this into their profile to link with you. ${summaries.length} of ${MAX_ELDERS_PER_CARETAKER} places used.`}
        />

        <div className="flex flex-wrap items-center gap-6">
          <p className="rounded-2xl border-2 border-black bg-neutral-100 px-8 py-5 text-4xl font-bold tracking-[0.2em] text-black">
            {currentUser.caretakerCode}
          </p>

          <Button
            size="md"
            variant="secondary"
            onClick={() => void copyCode()}
            icon={
              copied ? (
                <Check aria-hidden="true" size={22} />
              ) : (
                <Copy aria-hidden="true" size={22} />
              )
            }
          >
            {copied ? 'Code copied' : 'Copy code'}
          </Button>
        </div>

        <p aria-live="polite" className="care-help">
          {copied
            ? 'The code is on your clipboard.'
            : 'Read it out or send it to the elder — they enter it once.'}
        </p>
      </Card>

      <section aria-labelledby="care-team-heading">
        <h2
          id="care-team-heading"
          className="mb-5 text-2xl font-bold text-black sm:text-3xl"
        >
          My care team
        </h2>

        {summaries.length === 0 ? (
          <EmptyState
            icon={<Users size={48} />}
            title="No elders connected yet"
            description="Share your connection code above. Each elder enters it once, and up to three can link to you."
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {summaries.map((summary) => (
              <ElderSummaryCard
                key={summary.elder.id}
                summary={summary}
                avatarUrl={
                  summary.elder.avatarId
                    ? avatars[summary.elder.avatarId] ?? null
                    : null
                }
                selected={selectedElderId === summary.elder.id}
                onSelect={() =>
                  setSelectedElderId((current) =>
                    current === summary.elder.id ? null : summary.elder.id,
                  )
                }
                onAddMedicine={() => openAddMedicine(summary.elder.id)}
              />
            ))}
          </div>
        )}
      </section>

      {selected ? (
        <Card>
          <CardHeader
            title={`${selected.elder.fullName} — today's medicines`}
            description={`${selected.taken} taken, ${selected.missed} missed, ${selected.pending} pending.`}
            action={
              <Button
                size="sm"
                onClick={() => openAddMedicine(selected.elder.id)}
                icon={<Plus aria-hidden="true" size={20} />}
              >
                Add medicine
              </Button>
            }
          />

          {selected.medicines.length === 0 ? (
            <EmptyState
              icon={<Pill size={44} />}
              title="No medicines on this schedule"
              description="Add the first medicine and it appears on the elder's dashboard immediately."
            />
          ) : (
            <ul className="space-y-4">
              {selected.medicines.map((medicine) => (
                <li
                  key={medicine.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-black p-5"
                >
                  <div>
                    <p className="text-xl font-bold text-black">
                      {medicine.name}
                    </p>

                    <p className="text-lg text-neutral-700">
                      {medicine.dose} at {formatTime12(medicine.time)} —{' '}
                      {frequencyLabel(medicine.frequency)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusBadge status={medicine.status} />

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingMedicine(medicine);
                        setDraft(null);
                        setMedicineModalOpen(true);
                      }}
                      icon={<Pencil aria-hidden="true" size={20} />}
                      aria-label={`Edit ${medicine.name}`}
                    >
                      Edit
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      <AdherenceAuditTrail logs={teamLogs} users={users} />

      {medicineModalOpen && elders.length > 0 ? (
        <AddMedicineModal
          key={
            editingMedicine
              ? editingMedicine.id
              : draft
                ? draft.name
                : 'new-medicine'
          }
          open
          onClose={() => {
            setMedicineModalOpen(false);
            setEditingMedicine(null);
            setDraft(null);
          }}
          elders={elders}
          defaultElderId={selectedElderId ?? elders[0].id}
          editing={editingMedicine}
          draft={draft}
        />
      ) : null}

      <PrescriptionParseModal
        open={prescriptionOpen}
        onClose={() => setPrescriptionOpen(false)}
        onUseDraft={(value) => {
          if (elders.length === 0) {
            notify(
              'warning',
              'Connect an elder first',
              'Medicines belong to an elder, so link one before adding.',
              true,
            );
            return;
          }

          setPrescriptionOpen(false);
          setEditingMedicine(null);
          setDraft(value);
          setMedicineModalOpen(true);
        }}
      />
    </div>
  );
}

function Metric({
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

