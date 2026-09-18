import { useRef, useState } from 'react';
import { Camera, FlaskConical, Info } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import type { MedicineDraft } from './AddMedicineModal';
import { validateImageFile } from '../lib/validation';

/** Fixed demo output. No OCR runs here, and nothing is interpreted. */
const DEMO_EXTRACTION: MedicineDraft[] = [
  {
    name: 'Amlodipine',
    dose: '5 mg',
    time: '08:00',
    frequency: 'daily',
    notes: 'After breakfast.',
  },
  {
    name: 'Metformin',
    dose: '500 mg',
    time: '13:00',
    frequency: 'twice_daily',
    notes: 'With lunch.',
  },
];

export function PrescriptionParseModal({
  open,
  onClose,
  onUseDraft,
}: {
  open: boolean;
  onClose: () => void;
  onUseDraft: (draft: MedicineDraft) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;

    const problem = validateImageFile(file);

    if (problem) {
      setError(problem);
      return;
    }

    setError(null);
    setFileName(file.name);
    setStage('analyzing');

    window.setTimeout(() => setStage('done'), 1600);
  }

  function handleClose() {
    setStage('idle');
    setFileName('');
    setError(null);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Parse prescription image"
      description="Upload a photo of a prescription to see how the workflow would feel."
      size="lg"
      footer={
        <Button variant="secondary" size="lg" onClick={handleClose}>
          Close
        </Button>
      }
    >
      <div className="flex items-start gap-3 rounded-2xl border-2 border-black bg-neutral-100 p-5 text-black">
        <Info
          aria-hidden="true"
          size={28}
          className="mt-1 shrink-0"
        />

        <p className="text-base">
          Demo only — prescription parsing is simulated and must not be treated as medical advice. No text is read
          from your image, and the values below are fixed examples. Always check the printed prescription.
        </p>
      </div>

      <Button
        size="lg"
        variant="secondary"
        fullWidth
        icon={<Camera aria-hidden="true" size={26} />}
        onClick={() => inputRef.current?.click()}
      >
        Choose a prescription photo
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        aria-label="Choose a prescription image"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {error ? (
        <p role="alert" className="care-error">
          {error}
        </p>
      ) : null}

      {stage === 'analyzing' ? (
        <div aria-live="polite">
          <Spinner label={`Analyzing prescription… (${fileName})`} />
        </div>
      ) : null}

      {stage === 'done' ? (
        <div aria-live="polite" className="space-y-4">
          <h3 className="flex items-center gap-2 text-2xl font-bold text-black">
            <FlaskConical aria-hidden="true" size={26} />
            Example extracted values
          </h3>

          {DEMO_EXTRACTION.map((draft) => (
            <div
              key={draft.name}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-black p-5"
            >
              <div>
                <p className="text-xl font-bold text-black">
                  {draft.name}
                </p>

                <p className="text-lg text-neutral-700">
                  {draft.dose} at {draft.time}
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => onUseDraft(draft)}
              >
                Use these values
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </Modal>
  );
}
