import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { SelectField, TextAreaField, TextField } from './ui/Input';
import { useApp } from '../hooks/useApp';
import { useToast } from '../hooks/useToast';
import type {
  Elder,
  Medicine,
  MedicineFrequency,
  MedicineStatus,
} from '../types';
import type { FieldErrors } from '../lib/validation';
import {
  hasErrors,
  validateDose,
  validateMedicineName,
  validateTime,
} from '../lib/validation';

export interface MedicineDraft {
  name: string;
  dose: string;
  time: string;
  frequency: MedicineFrequency;
  notes: string;
}

export function AddMedicineModal({
  open,
  onClose,
  elders,
  defaultElderId,
  editing,
  draft,
}: {
  open: boolean;
  onClose: () => void;
  elders: Elder[];
  defaultElderId: string;
  editing?: Medicine | null;
  draft?: MedicineDraft | null;
}) {
  const { addMedicine, updateMedicine } = useApp();
  const { notify } = useToast();

  const [elderId, setElderId] = useState(
    editing?.elderId ?? defaultElderId,
  );
  const [name, setName] = useState(
    editing?.name ?? draft?.name ?? '',
  );
  const [dose, setDose] = useState(
    editing?.dose ?? draft?.dose ?? '',
  );
  const [time, setTime] = useState(
    editing?.time ?? draft?.time ?? '08:00',
  );
  const [frequency, setFrequency] = useState<MedicineFrequency>(
    editing?.frequency ?? draft?.frequency ?? 'daily',
  );
  const [status, setStatus] = useState<MedicineStatus>(
    editing?.status ?? 'scheduled',
  );
  const [notes, setNotes] = useState(
    editing?.notes ?? draft?.notes ?? '',
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    const nextErrors: FieldErrors = {
      name: validateMedicineName(name) ?? '',
      dose: validateDose(dose) ?? '',
      time: validateTime(time) ?? '',
      elderId: elderId
        ? ''
        : 'Choose which elder this medicine belongs to.',
    };

    setErrors(nextErrors);

    if (hasErrors(nextErrors)) return;

    setBusy(true);

    const result = editing
      ? await updateMedicine(editing.id, {
          name,
          dose,
          time,
          frequency,
          notes,
          elderId,
          status,
        })
      : await addMedicine({
          elderId,
          name,
          dose,
          time,
          frequency,
          notes,
        });

    setBusy(false);

    if (!result.ok) {
      notify(
        'error',
        'Could not save the medicine',
        result.error,
        true,
      );
      return;
    }

    notify(
      'success',
      editing ? 'Medicine updated' : 'Medicine added',
      `${name} at ${time}.`,
    );

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit medicine' : 'Add a medicine'}
      description="The elder sees this on their schedule, and gets one hour from the scheduled time to confirm it."
      size="lg"
      footer={
        <>
          <Button
            variant="secondary"
            size="lg"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            size="lg"
            onClick={() => void handleSave()}
            disabled={busy}
          >
            {busy
              ? 'Saving…'
              : editing
                ? 'Save changes'
                : 'Add medicine'}
          </Button>
        </>
      }
    >
      <SelectField
        label="Elder"
        value={elderId}
        error={errors.elderId || undefined}
        onChange={(event) => setElderId(event.target.value)}
      >
        {elders.map((elder) => (
          <option key={elder.id} value={elder.id}>
            {elder.fullName}
          </option>
        ))}
      </SelectField>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Medicine name"
          value={name}
          error={errors.name || undefined}
          onChange={(event) => setName(event.target.value)}
        />

        <TextField
          label="Dose"
          value={dose}
          error={errors.dose || undefined}
          help="For example 5 mg, or 1 tablet."
          onChange={(event) => setDose(event.target.value)}
        />

        <TextField
          label="Scheduled time"
          type="time"
          value={time}
          error={errors.time || undefined}
          onChange={(event) => setTime(event.target.value)}
        />

        <SelectField
          label="Frequency"
          value={frequency}
          onChange={(event) =>
            setFrequency(event.target.value as MedicineFrequency)
          }
        >
          <option value="daily">Every day</option>
          <option value="twice_daily">Twice a day</option>
          <option value="weekly">Once a week</option>
          <option value="as_needed">Only when needed</option>
        </SelectField>
      </div>

      {editing ? (
        <SelectField
          label="Status"
          value={status}
          help="Pause a medicine to keep it on file without reminding the elder."
          onChange={(event) =>
            setStatus(event.target.value as MedicineStatus)
          }
        >
          <option value="scheduled">Pending</option>
          <option value="taken">Taken</option>
          <option value="not_taken">Not taken</option>
          <option value="missed">Missed</option>
          <option value="disabled">Paused</option>
        </SelectField>
      ) : null}

      <TextAreaField
        label="Notes for the elder (optional)"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Take after food with a full glass of water."
      />
    </Modal>
  );
}

