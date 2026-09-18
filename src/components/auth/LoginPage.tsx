import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Home,
  UserRound,
  UsersRound,
} from 'lucide-react';

import { AuthLayout } from './AuthLayout';
import { Button } from '../ui/Button';
import { TextField } from '../ui/Input';
import { useApp } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';
import { validateEmail } from '../../lib/validation';
import { demoCredentials } from '../../data/mockData';
import type { UserRole } from '../../types';

export function LoginPage({
  onGoToSignup,
  onGoToForgotPassword,
  onGoToHome,
}: {
  onGoToSignup: () => void;
  onGoToForgotPassword: () => void;
  onGoToHome: () => void;
}) {
  const { login, rememberedEmail } = useApp();
  const { notify } = useToast();

  const [role, setRole] = useState<UserRole>('elder');
  const [email, setEmail] = useState(rememberedEmail ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(Boolean(rememberedEmail));
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const emailProblem = validateEmail(email);
    setEmailError(emailProblem ?? undefined);

    if (emailProblem) {
      return;
    }

    if (!password) {
      setFormError('Enter your password.');
      return;
    }

    setSubmitting(true);

    const result = await login(
      email,
      password,
      role,
      remember,
    );

    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    notify(
      'success',
      'Signed in',
      'Welcome back to CareAI.',
    );
  }

  return (
    <AuthLayout
      title="Sign in to CareAI"
      subtitle="Keep track of every dose, and let the people who care for you see how the day is going."
    >
      {/* ================================================================ */}
      {/* Home Navigation                                                  */}
      {/* ================================================================ */}

      <div className="mb-7">
        <button
          type="button"
          onClick={onGoToHome}
          className="
            inline-flex
            min-h-14
            items-center
            gap-3
            rounded-2xl
            border-2
            border-black
            bg-white
            px-5
            text-lg
            font-bold
            text-black
            shadow-sm
            transition
            hover:bg-neutral-100
            focus:outline-none
            focus:ring-4
            focus:ring-black
            focus:ring-offset-2
          "
        >
          <Home
            size={23}
            strokeWidth={2.5}
            aria-hidden="true"
          />

          Home
        </button>
      </div>

      {/* ================================================================ */}
      {/* Login Form                                                        */}
      {/* ================================================================ */}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-7"
      >
        {/* Role Selection */}
        <fieldset>
          <legend
            className="
              mb-3
              text-lg
              font-extrabold
              text-black
            "
          >
            I am signing in as
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(['elder', 'caretaker'] as UserRole[]).map(
              (option) => {
                const isSelected = role === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setRole(option);
                      setFormError(null);
                    }}
                    aria-pressed={isSelected}
                    className={`
                      flex
                      min-h-20
                      items-center
                      justify-center
                      gap-3
                      rounded-2xl
                      border-2
                      px-5
                      text-xl
                      font-extrabold
                      shadow-sm
                      transition
                      focus:outline-none
                      focus:ring-4
                      focus:ring-black
                      focus:ring-offset-2
                      ${
                        isSelected
                          ? 'border-black bg-black text-white shadow-lg'
                          : 'border-black bg-white text-black hover:bg-neutral-100'
                      }
                    `}
                  >
                    {option === 'elder' ? (
                      <UserRound
                        size={25}
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    ) : (
                      <UsersRound
                        size={25}
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    )}

                    {option === 'elder'
                      ? 'Elder'
                      : 'Caretaker'}
                  </button>
                );
              },
            )}
          </div>
        </fieldset>

        {/* Email */}
        <TextField
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          error={emailError}
          onChange={(event) => {
            setEmail(event.target.value);

            if (emailError) {
              setEmailError(undefined);
            }

            if (formError) {
              setFormError(null);
            }
          }}
          placeholder="name@example.com"
        />

        {/* Password */}
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);

            if (formError) {
              setFormError(null);
            }
          }}
          trailing={
            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (current) => !current,
                )
              }
              aria-label={
                showPassword
                  ? 'Hide password'
                  : 'Show password'
              }
              aria-pressed={showPassword}
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-xl
                text-black
                transition
                hover:bg-neutral-100
                focus:outline-none
                focus:ring-2
                focus:ring-black
                focus:ring-offset-1
              "
            >
              {showPassword ? (
                <EyeOff
                  size={25}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              ) : (
                <Eye
                  size={25}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              )}
            </button>
          }
        />

        {/* Remember / Forgot Password */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label
            className="
              flex
              min-h-12
              cursor-pointer
              items-center
              gap-3
              text-lg
              font-bold
              text-black
            "
          >
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) =>
                setRemember(event.target.checked)
              }
              className="
                h-7
                w-7
                cursor-pointer
                rounded-md
                border-2
                border-black
                accent-black
                focus:ring-2
                focus:ring-black
                focus:ring-offset-2
              "
            />

            Remember my email
          </label>

          <button
            type="button"
            onClick={onGoToForgotPassword}
            className="
              min-h-12
              self-start
              rounded-xl
              px-2
              py-2
              text-lg
              font-bold
              text-black
              underline
              decoration-2
              underline-offset-4
              transition
              hover:bg-neutral-100
              focus:outline-none
              focus:ring-2
              focus:ring-black
            "
          >
            Forgot password?
          </button>
        </div>

        {/* Form Error */}
        {formError ? (
          <div
            role="alert"
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border-2
              border-black
              bg-neutral-100
              p-5
              text-lg
              font-bold
              text-black
            "
          >
            <AlertCircle
              size={27}
              strokeWidth={2.5}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />

            <span>{formError}</span>
          </div>
        ) : null}

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={submitting}
          icon={
            <LogIn
              size={26}
              strokeWidth={2.5}
              aria-hidden="true"
            />
          }
        >
          {submitting
            ? 'Signing in…'
            : 'Sign in'}
        </Button>

        {/* Signup */}
        <p className="text-center text-lg text-neutral-700">
          Don&apos;t have an account?{' '}

          <button
            type="button"
            onClick={onGoToSignup}
            className="
              rounded-xl
              px-2
              py-1
              font-extrabold
              text-black
              underline
              decoration-2
              underline-offset-4
              transition
              hover:bg-neutral-100
              focus:outline-none
              focus:ring-2
              focus:ring-black
            "
          >
            Sign up
          </button>
        </p>
      </form>

      {/* ================================================================ */}
      {/* Demo Accounts                                                     */}
      {/* ================================================================ */}

      <section
        aria-labelledby="demo-accounts-heading"
        className="
          mt-8
          rounded-2xl
          border-2
          border-black
          bg-neutral-100
          p-5
          sm:p-6
        "
      >
        <h2
          id="demo-accounts-heading"
          className="
            text-xl
            font-extrabold
            text-black
          "
        >
          Demo accounts
        </h2>

        <p className="mt-2 text-base font-medium text-neutral-600">
          Seeded on first run so you can look around
          straight away.
        </p>

        <ul className="mt-4 space-y-3">
          {demoCredentials.map((account) => (
            <li
              key={account.email}
              className="
                rounded-xl
                border-2
                border-neutral-300
                bg-white
                p-4
                text-base
                leading-7
                text-black
              "
            >
              <span className="font-extrabold">
                {account.role}
              </span>

              <span className="text-neutral-500">
                {' '}
                —
                {' '}
              </span>

              <span className="font-semibold">
                {account.email}
              </span>

              <span className="text-neutral-500">
                {' '}
                · Password:{' '}
              </span>

              <span className="font-bold">
                {account.password}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </AuthLayout>
  );
}

