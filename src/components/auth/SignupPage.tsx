import { useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '../ui/Button';
import { TextField } from '../ui/Input';
import { AvatarPicker } from '../profile/AvatarPicker';
import { useApp } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';
import type { FieldErrors } from '../../lib/validation';
import {
  hasErrors,
  validateAge,
  validateEmail,
  validateFullName,
  validatePassword,
  validatePasswordMatch,
  validatePhone,
  validateUsername,
} from '../../lib/validation';
import { isCaretakerCodeShaped } from '../../lib/caretakerCode';
import type { UserRole } from '../../types';

export function SignupPage({
  onGoToLogin,
}: {
  onGoToLogin: () => void;
}) {
  const { signup } = useApp();
  const { notify } = useToast();

  const [role, setRole] = useState<UserRole>('elder');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [caretakerCode, setCaretakerCode] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors: FieldErrors = {
      fullName: validateFullName(fullName) ?? '',
      username: validateUsername(username) ?? '',
      email: validateEmail(email) ?? '',
      phone: validatePhone(phone) ?? '',
      age: validateAge(age) ?? '',
      password: validatePassword(password) ?? '',
      confirmPassword:
        validatePasswordMatch(password, confirmPassword) ?? '',
      emergencyName: emergencyName.trim()
        ? ''
        : 'Name the person to call in an emergency.',
      emergencyPhone: validatePhone(emergencyPhone) ?? '',
      caretakerCode:
        role === 'elder' &&
        caretakerCode.trim() &&
        !isCaretakerCodeShaped(caretakerCode)
          ? 'Caretaker codes look like CARE-7F29K4.'
          : '',
    };

    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      setFormError('Check the highlighted fields and try again.');
      return;
    }

    setSubmitting(true);

    const result = await signup({
      fullName,
      username,
      email,
      phone,
      password,
      role,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
      age: age.trim() ? Number(age) : null,
      avatarDataUrl: avatar,
      caretakerCode: role === 'elder' ? caretakerCode : '',
    });

    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    if (result.data.role === 'caretaker') {
      notify(
        'success',
        'Account created',
        `Your connection code is ${result.data.caretakerCode}. Share it with the elders you look after.`,
        true,
      );
    } else {
      notify('success', 'Account created', 'Welcome to CareAI.');
    }
  }

  return (
    <AuthLayout
      title="Create your CareAI account"
      subtitle="Elders get a simple daily schedule. Caretakers get a code that links them to up to three elders."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-7">
        <fieldset>
          <legend className="mb-3 text-xl font-bold text-black">
            I am joining as
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(['elder', 'caretaker'] as UserRole[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setRole(option);
                  setFormError(null);
                }}
                aria-pressed={role === option}
                className={`h-20 rounded-2xl border-2 px-5 text-xl font-semibold shadow-sm transition-colors focus:outline-none focus:ring-4 focus:ring-black/20 ${
                  role === option
                    ? 'border-black bg-black text-white'
                    : 'border-black bg-white text-black hover:bg-neutral-100'
                }`}
              >
                {option === 'elder' ? 'Elder' : 'Caretaker'}
              </button>
            ))}
          </div>

          <p className="mt-3 text-base leading-relaxed text-neutral-700">
            {role === 'caretaker'
              ? 'You will receive a connection code as soon as your account is created.'
              : 'You can connect to a caretaker now, or later from your profile.'}
          </p>
        </fieldset>

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
            autoComplete="name"
            onChange={(event) => {
              setFullName(event.target.value);
              setErrors((current) => ({ ...current, fullName: '' }));
              setFormError(null);
            }}
          />

          <TextField
            label="Username"
            value={username}
            error={errors.username || undefined}
            help="Everyone needs a different username."
            autoComplete="username"
            onChange={(event) => {
              setUsername(event.target.value);
              setErrors((current) => ({ ...current, username: '' }));
              setFormError(null);
            }}
          />

          <TextField
            label="Email address"
            type="email"
            value={email}
            error={errors.email || undefined}
            autoComplete="email"
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((current) => ({ ...current, email: '' }));
              setFormError(null);
            }}
          />

          <TextField
            label="Phone number"
            type="tel"
            value={phone}
            error={errors.phone || undefined}
            autoComplete="tel"
            onChange={(event) => {
              setPhone(event.target.value);
              setErrors((current) => ({ ...current, phone: '' }));
              setFormError(null);
            }}
          />

          <TextField
            label="Age (optional)"
            type="number"
            min={1}
            max={120}
            value={age}
            error={errors.age || undefined}
            onChange={(event) => {
              setAge(event.target.value);
              setErrors((current) => ({ ...current, age: '' }));
              setFormError(null);
            }}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            error={errors.password || undefined}
            help="At least 8 characters, with a letter and a number."
            autoComplete="new-password"
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((current) => ({ ...current, password: '' }));
              setFormError(null);
            }}
            trailing={
              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
                aria-pressed={showPassword}
                className="flex h-14 w-14 items-center justify-center rounded-xl text-black transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-4 focus:ring-black/20"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" size={24} />
                ) : (
                  <Eye aria-hidden="true" size={24} />
                )}
              </button>
            }
          />

          <TextField
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            error={errors.confirmPassword || undefined}
            autoComplete="new-password"
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setErrors((current) => ({
                ...current,
                confirmPassword: '',
              }));
              setFormError(null);
            }}
          />

          <TextField
            label="Emergency contact name"
            value={emergencyName}
            error={errors.emergencyName || undefined}
            onChange={(event) => {
              setEmergencyName(event.target.value);
              setErrors((current) => ({
                ...current,
                emergencyName: '',
              }));
              setFormError(null);
            }}
          />

          <TextField
            label="Emergency contact phone"
            type="tel"
            value={emergencyPhone}
            error={errors.emergencyPhone || undefined}
            onChange={(event) => {
              setEmergencyPhone(event.target.value);
              setErrors((current) => ({
                ...current,
                emergencyPhone: '',
              }));
              setFormError(null);
            }}
          />
        </div>

        {role === 'elder' ? (
          <TextField
            label="Caretaker code (optional)"
            value={caretakerCode}
            error={errors.caretakerCode || undefined}
            help="Ask your caretaker for their code, for example CARE-7F29K4."
            onChange={(event) => {
              setCaretakerCode(event.target.value.toUpperCase());
              setErrors((current) => ({
                ...current,
                caretakerCode: '',
              }));
              setFormError(null);
            }}
          />
        ) : null}

        {formError ? <FormError message={formError} /> : null}

        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={submitting}
          icon={<UserPlus aria-hidden="true" size={26} />}
        >
          {submitting ? 'Creating your account…' : 'Create account'}
        </Button>

        <p className="text-center text-lg text-neutral-700">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onGoToLogin}
            className="rounded-xl px-2 py-1 font-semibold text-black underline decoration-2 underline-offset-4 hover:bg-neutral-100 focus:outline-none focus:ring-4 focus:ring-black/20"
          >
            Sign in
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-3 rounded-2xl border-2 border-black bg-neutral-100 p-4 text-lg font-semibold text-black"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black text-white">
        <AlertCircle aria-hidden="true" size={21} />
      </span>

      <span>{message}</span>
    </p>
  );
}
