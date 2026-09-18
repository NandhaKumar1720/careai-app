import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldShellProps {
  label: string;
  error?: string;
  help?: string;
  children: (ids: { inputId: string; describedBy: string | undefined }) => ReactNode;
}

function FieldShell({ label, error, help, children }: FieldShellProps) {
  const base = useId();
  const inputId = `${base}-control`;
  const helpId = help ? `${base}-help` : undefined;
  const errorId = error ? `${base}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label className="care-label" htmlFor={inputId}>
        {label}
      </label>
      {children({ inputId, describedBy })}
      {help ? (
        <p id={helpId} className="care-help">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="care-error">
          <AlertCircle aria-hidden="true" size={20} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  help?: string;
  trailing?: ReactNode;
}

export function TextField({ label, error, help, trailing, className = '', ...rest }: TextFieldProps) {
  return (
    <FieldShell label={label} error={error} help={help}>
      {({ inputId, describedBy }) => (
        <div className="relative">
          <input
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            className={`care-input ${error ? 'border-red-600' : ''} ${trailing ? 'pr-20' : ''} ${className}`}
            {...rest}
          />
          {trailing ? <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div> : null}
        </div>
      )}
    </FieldShell>
  );
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  error?: string;
  help?: string;
  children: ReactNode;
}

export function SelectField({ label, error, help, children, className = '', ...rest }: SelectFieldProps) {
  return (
    <FieldShell label={label} error={error} help={help}>
      {({ inputId, describedBy }) => (
        <select
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={`care-input ${error ? 'border-red-600' : ''} ${className}`}
          {...rest}
        >
          {children}
        </select>
      )}
    </FieldShell>
  );
}

export interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  error?: string;
  help?: string;
}

export function TextAreaField({ label, error, help, className = '', ...rest }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} error={error} help={help}>
      {({ inputId, describedBy }) => (
        <textarea
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          rows={3}
          className={`w-full rounded-2xl border-2 border-slate-300 bg-white px-5 py-4 text-lg text-slate-900 focus:border-blue-600 ${
            error ? 'border-red-600' : ''
          } ${className}`}
          {...rest}
        />
      )}
    </FieldShell>
  );
}
