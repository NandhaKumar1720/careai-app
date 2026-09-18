import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { ProfileAvatar } from './ProfileAvatar';
import { Button } from '../ui/Button';
import { readAndCompressImage } from '../../lib/image';

export function AvatarPicker({
  name,
  value,
  onChange,
  label = 'Profile picture',
}: {
  name: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    setError(null);
    setBusy(true);

    try {
      const dataUrl = await readAndCompressImage(file);
      onChange(dataUrl);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : 'That image could not be used.',
      );
    } finally {
      setBusy(false);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  return (
    <div>
      <span className="care-label">{label}</span>

      <div className="flex flex-wrap items-center gap-5">
        <ProfileAvatar
          name={name || 'New user'}
          dataUrl={value}
          size="lg"
        />

        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            variant="secondary"
            icon={<Camera aria-hidden="true" size={20} />}
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {value ? 'Replace photo' : 'Choose photo'}
          </Button>

          {value ? (
            <Button
              size="sm"
              variant="ghost"
              icon={<Trash2 aria-hidden="true" size={20} />}
              onClick={() => onChange(null)}
            >
              Remove photo
            </Button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-label="Choose a profile picture from this device"
          onChange={(event) =>
            void handleFile(event.target.files?.[0])
          }
        />
      </div>

      <p className="care-help">
        PNG, JPG or WEBP, up to 5 MB. The photo stays on this device.
      </p>

      {busy ? (
        <p className="care-help" role="status">
          Preparing your photo…
        </p>
      ) : null}

      {error ? (
        <p className="care-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
