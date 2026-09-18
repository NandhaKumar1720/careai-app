import { createContext, useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Toast, ToastKind } from '../types';
import { createId } from '../lib/ids';

export interface ToastContextValue {
  toasts: Toast[];
  notify: (kind: ToastKind, title: string, description?: string, sticky?: boolean) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/** Elderly users need time to read, so nothing disappears in under 8 seconds. */
const AUTO_DISMISS_MS = 9000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (kind: ToastKind, title: string, description = '', sticky = false) => {
      const toast: Toast = { id: createId('toast'), kind, title, description, sticky };
      setToasts((current) => [...current, toast]);
      if (!sticky && kind !== 'error') {
        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== toast.id));
        }, AUTO_DISMISS_MS);
      }
    },
    [],
  );

  const value = useMemo<ToastContextValue>(() => ({ toasts, notify, dismiss }), [toasts, notify, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
