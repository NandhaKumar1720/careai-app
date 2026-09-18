import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { getFocusable } from '../../utils/accessibility';

export interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: (() => void) | null;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
  labelledById?: string;
}

const SIZES = {
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = description ? `${baseId}-description` : undefined;

  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    if (panel) {
      const focusable = getFocusable(panel);
      (focusable[0] ?? panel).focus();
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = getFocusable(panelRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/70 p-0 sm:items-center sm:p-6">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={`max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8 ${SIZES[size]}`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-2 text-lg text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title}`}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            >
              <X aria-hidden="true" size={26} />
            </button>
          ) : null}
        </div>

        <div className="space-y-6">{children}</div>

        {footer ? <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">{footer}</div> : null}
      </div>
    </div>
  );
}
