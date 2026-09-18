import { useEffect } from 'react';
import { useApp } from './useApp';

const CHECK_INTERVAL_MS = 30_000;

/**
 * Re-checks open reminders on a timer, when the tab regains focus, and once on
 * mount — so a window that lapsed while the app was closed is still recorded.
 */
export function useReminderExpiry(): void {
  const { ready, runExpiryCheck } = useApp();

  useEffect(() => {
    if (!ready) return undefined;

    void runExpiryCheck();

    const interval = window.setInterval(() => {
      void runExpiryCheck();
    }, CHECK_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void runExpiryCheck();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [ready, runExpiryCheck]);
}
