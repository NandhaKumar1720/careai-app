import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import type { ToastKind } from '../../types';

const TONES: Record<ToastKind, string> = {
  success: 'border-emerald-600 bg-emerald-50 text-emerald-900',
  warning: 'border-amber-600 bg-amber-50 text-amber-900',
  error: 'border-red-600 bg-red-50 text-red-900',
  info: 'border-blue-600 bg-blue-50 text-blue-900',
};

function ToastIcon({ kind }: { kind: ToastKind }) {
  switch (kind) {
    case 'success':
      return <CheckCircle aria-hidden="true" size={28} />;
    case 'warning':
      return <AlertTriangle aria-hidden="true" size={28} />;
    case 'error':
      return <XCircle aria-hidden="true" size={28} />;
    case 'info':
    default:
      return <Info aria-hidden="true" size={28} />;
  }
}

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col gap-3 sm:inset-x-auto sm:right-6 sm:top-6 sm:w-[26rem]"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.kind === 'error' ? 'alert' : 'status'}
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl border-2 p-4 shadow-xl ${TONES[toast.kind]}`}
        >
          <ToastIcon kind={toast.kind} />
          <div className="flex-1">
            <p className="text-lg font-bold">{toast.title}</p>
            {toast.description ? <p className="text-base">{toast.description}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label={`Dismiss: ${toast.title}`}
            className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black/10 hover:bg-white/60"
          >
            <X aria-hidden="true" size={22} />
          </button>
        </div>
      ))}
    </div>
  );
}
