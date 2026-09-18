import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { MessageCircle, Send, ShieldCheck, X } from 'lucide-react';
import { Button } from './ui/Button';
import { useApp } from '../hooks/useApp';
import { CAREAI_SAFETY_BANNER, QUICK_PROMPTS } from '../lib/careai';
import { getFocusable } from '../utils/accessibility';

export function CareAIChatDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { chat, sendChatMessage, currentUser } = useApp();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return undefined;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel) (getFocusable(panel)[0] ?? panel).focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = getFocusable(panelRef.current);
      if (focusable.length === 0) return;

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

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' });
  }, [chat.length, open]);

  if (!open || !currentUser) return null;

  async function ask(question: string) {
    if (!question.trim() || busy) return;

    setBusy(true);
    await sendChatMessage(question);
    setBusy(false);
    setText('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(text);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="CareAI assistant"
        tabIndex={-1}
        className="flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-lg"
      >
        <header className="flex items-start justify-between gap-4 border-b-2 border-black p-5">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white"
            >
              <MessageCircle size={28} />
            </span>

            <div>
              <h2 className="text-2xl font-bold text-black">CareAI</h2>
              <p className="text-base text-neutral-700">Your schedule helper</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close CareAI"
            className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black text-black hover:bg-neutral-100"
          >
            <X aria-hidden="true" size={26} />
          </button>
        </header>

        <p className="flex items-start gap-3 border-b-2 border-black bg-neutral-100 p-5 text-base text-black">
          <ShieldCheck aria-hidden="true" size={26} className="mt-0.5 shrink-0" />
          {CAREAI_SAFETY_BANNER}
        </p>

        <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
          {chat.length === 0 ? (
            <p className="text-lg text-neutral-700">
              Ask about today’s medicines, what is next, or what has been missed. CareAI reads your saved schedule
              and nothing else.
            </p>
          ) : null}

          {chat.map((message) => (
            <div
              key={message.id}
              className={`max-w-[90%] whitespace-pre-line rounded-2xl border-2 p-4 text-lg ${
                message.sender === 'user'
                  ? 'ml-auto border-black bg-black text-white'
                  : 'border-black bg-neutral-100 text-black'
              }`}
            >
              <p className="mb-1 text-base font-semibold opacity-80">
                {message.sender === 'user' ? 'You' : 'CareAI'}
              </p>
              {message.text}
            </div>
          ))}

          <div ref={endRef} />
        </div>

        <div className="border-t-2 border-black p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void ask(prompt)}
                disabled={busy}
                className="min-h-[3rem] rounded-2xl border-2 border-black px-4 py-2 text-base font-semibold text-black hover:bg-neutral-100 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="careai-input" className="care-label">
                Your question
              </label>

              <input
                id="careai-input"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="What is my next medicine?"
                className="care-input"
              />
            </div>

            <Button
              type="submit"
              size="md"
              disabled={busy || !text.trim()}
              aria-label="Send question"
              icon={<Send aria-hidden="true" size={24} />}
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
