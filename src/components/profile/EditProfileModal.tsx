import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TextField } from '../ui/Input';
import { AvatarPicker } from './AvatarPicker';
import { useApp } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';
import type { FieldErrors } from '../../lib/validation';
import {
  hasErrors,
  validateAge,
  validateEmail,
  validateFullName,
  validatePhone,
  validateUsername,
} from '../../lib/validation';

export function EditProfileModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { currentUser, avatars, updateProfile } = useApp();
  const { notify } = useToast();

  const initialAvatar = currentUser?.avatarId
    ? avatars[currentUser.avatarId] ?? null
    : null;

  const [fullName, setFullName] = useState(currentUser?.fullName ?? '');
  const [username, setUsername] = useState(currentUser?.username ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [age, setAge] = useState(
    currentUser?.age ? String(currentUser.age) : '',
  );
  const [emergencyName, setEmergencyName] = useState(
    currentUser?.emergencyContactName ?? '',
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    currentUser?.emergencyContactPhone ?? '',
  );
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!currentUser) return null;

  async function handleSave() {
    setFormError(null);

    const nextErrors: FieldErrors = {
      fullName: validateFullName(fullName) ?? '',
      username: validateUsername(username) ?? '',
      email: validateEmail(email) ?? '',
      phone: validatePhone(phone) ?? '',
      age: validateAge(age) ?? '',
      emergencyName: emergencyName.trim()
        ? ''
        : 'Name the person to call in an emergency.',
      emergencyPhone: validatePhone(emergencyPhone) ?? '',
    };

    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      setFormError('Check the highlighted fields and try again.');
      return;
    }

    setBusy(true);

    const result = await updateProfile(
      {
        fullName,
        username,
        email,
        phone,
        age: age.trim() ? Number(age) : null,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
      },
      avatar === initialAvatar ? undefined : { dataUrl: avatar },
    );

    setBusy(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    notify(
      'success',
      'Profile saved',
      'Your details are updated on this device.',
    );

    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      description="These details are stored in this browser only."
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="lg" onClick={onClose}>
            Cancel
          </Button>

          <Button
            size="lg"
            onClick={() => void handleSave()}
            disabled={busy}
          >
            {busy ? 'Saving…' : 'Save changes'}
          </Button>
        </>
      }
    >
      <AvatarPicker
        name={fullName}
        value={avatar}
        onChange={setAvatar}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Full name"
          value={fullName}
          error={errors.fullName || undefined}
          onChange={(e) => setFullName(e.target.value)}
        />

        <TextField
          label="Username"
          value={username}
          error={errors.username || undefined}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          label="Email address"
          type="email"
          value={email}
          error={errors.email || undefined}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Phone number"
          type="tel"
          value={phone}
          error={errors.phone || undefined}
          onChange={(e) => setPhone(e.target.value)}
        />

        <TextField
          label="Age (optional)"
          type="number"
          value={age}
          error={errors.age || undefined}
          onChange={(e) => setAge(e.target.value)}
        />

        <TextField
          label="Emergency contact name"
          value={emergencyName}
          error={errors.emergencyName || undefined}
          onChange={(e) => setEmergencyName(e.target.value)}
        />

        <TextField
          label="Emergency contact phone"
          type="tel"
          value={emergencyPhone}
          error={errors.emergencyPhone || undefined}
          onChange={(e) => setEmergencyPhone(e.target.value)}
        />
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-2xl border-2 border-black bg-neutral-100 p-4 text-lg font-semibold text-black"
        >
          {formError}
        </p>
      ) : null}
    </Modal>
  );
}
