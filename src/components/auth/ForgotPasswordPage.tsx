import { useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '../ui/Button';
import { TextField } from '../ui/Input';
import { useApp } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';
import { validateEmail, validatePassword, validatePasswordMatch } from '../../lib/validation';

type Step = 'email' | 'code' | 'password';

export function ForgotPasswordPage({ onGoToLogin }: { onGoToLogin: () => void }) {
  const { requestPasswordReset, resetPassword } = useApp();
  const { notify } = useToast();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [issuedCode, setIssuedCode] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const problem = validateEmail(email);
    setFieldError(problem ?? undefined);

    if (problem) return;

    setBusy(true);
    const result = await requestPasswordReset(email);
    setBusy(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setIssuedCode(result.data);
    setStep('code');
  }

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (code.trim() !== issuedCode) {
      setFormError(
        'That code is not correct. It is shown on this screen because no email is sent.',
      );
      return;
    }

    setStep('password');
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const problem =
      validatePassword(password) ??
      validatePasswordMatch(password, confirmPassword);

    if (problem) {
      setFormError(problem);
      return;
    }

    setBusy(true);
    const result = await resetPassword(email, code, password);
    setBusy(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    notify('success', 'Password changed', 'Sign in with your new password.');
    onGoToLogin();
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Three steps: confirm your email, enter the code shown on screen, then choose a new password."
      footer={
        <Button
          variant="secondary"
          size="md"
          onClick={onGoToLogin}
          icon={<ArrowLeft aria-hidden="true" size={22} />}
        >
          Back to sign in
        </Button>
      }
    >
      <div className="mb-8 flex items-start gap-3 rounded-2xl border-2 border-black bg-neutral-100 p-5 text-black">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
          <ShieldCheck aria-hidden="true" size={24} />
        </span>

        <p className="text-base leading-relaxed">
          Demo reset. CareAI has no email service here, so the reset code
          appears on this screen instead of in your inbox.
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={submitEmail} noValidate className="space-y-7">
          <TextField
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            error={fieldError}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldError(undefined);
              setFormError(null);
            }}
          />

          {formError ? <FormError message={formError} /> : null}

          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={busy}
            icon={<KeyRound aria-hidden="true" size={26} />}
          >
            {busy ? 'Checking…' : 'Find my account'}
          </Button>
        </form>
      ) : null}

      {step === 'code' ? (
        <form onSubmit={submitCode} noValidate className="space-y-7">
          <div
            className="rounded-2xl border-2 border-black bg-neutral-100 p-6 text-black"
            aria-live="polite"
          >
            <p className="text-lg font-medium">Your reset code is</p>

            <p className="mt-2 text-4xl font-bold tracking-[0.3em]">
              {issuedCode}
            </p>
          </div>

          <TextField
            label="Reset code"
            inputMode="numeric"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setFormError(null);
            }}
          />

          {formError ? <FormError message={formError} /> : null}

          <Button type="submit" size="lg" fullWidth>
            Check code
          </Button>
        </form>
      ) : null}

      {step === 'password' ? (
        <form onSubmit={submitPassword} noValidate className="space-y-7">
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            help="At least 8 characters, with a letter and a number."
            onChange={(event) => {
              setPassword(event.target.value);
              setFormError(null);
            }}
          />

          <TextField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setFormError(null);
            }}
          />

          {formError ? <FormError message={formError} /> : null}

          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={busy}
          >
            {busy ? 'Saving…' : 'Save new password'}
          </Button>
        </form>
      ) : null}
    </AuthLayout>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-3 rounded-2xl border-2 border-black bg-neutral-100 p-4 text-lg font-semibold text-black"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black text-white">
        <AlertCircle aria-hidden="true" size={20} />
      </span>

      <span>{message}</span>
    </p>
  );
}
