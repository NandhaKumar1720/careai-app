import { useState } from 'react';
import { AlertOctagon, MessageCircle } from 'lucide-react';

import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { ToastViewport } from './components/ui/ToastViewport';

import { Header } from './components/Header';
import type { AppView } from './components/Header';

import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';

import { ElderlyDashboard } from './components/ElderlyDashboard';
import { CaregiverDashboard } from './components/CaregiverDashboard';
import { ProfilePage } from './components/profile/ProfilePage';
import { ProtectedRoute } from './components/ProtectedRoute';

import { CareAIChatDrawer } from './components/CareAIChatDrawer';
import { EmergencyContactModal } from './components/EmergencyContactModal';

import { Spinner } from './components/ui/Spinner';

import { useApp } from './hooks/useApp';
import { useReminderExpiry } from './hooks/useReminderExpiry';

import LandingPage from './components/LandingPage';

type AuthScreen = 'landing' | 'login' | 'signup' | 'forgot';

/* -------------------------------------------------------------------------- */
/* Auth Flow                                                                  */
/* -------------------------------------------------------------------------- */

function AuthFlow() {
  const [screen, setScreen] = useState<AuthScreen>('landing');

  if (screen === 'landing') {
    return (
      <LandingPage
        onLogin={() => setScreen('login')}
        onSignup={() => setScreen('signup')}
      />
    );
  }

  if (screen === 'signup') {
    return (
      <SignupPage
        onGoToLogin={() => setScreen('login')}
      />
    );
  }

  if (screen === 'forgot') {
    return (
      <ForgotPasswordPage
        onGoToLogin={() => setScreen('login')}
      />
    );
  }

  return (
    <LoginPage
      onGoToSignup={() => setScreen('signup')}
      onGoToForgotPassword={() => setScreen('forgot-password')}
      onGoToHome={() => setScreen('landing')}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Boot Screen                                                                */
/* -------------------------------------------------------------------------- */

function BootScreen({ error }: { error: string | null }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-xl rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-lg">
        {error ? (
          <div
            className="flex items-start gap-4"
            role="alert"
          >
            <AlertOctagon
              aria-hidden="true"
              size={34}
              className="mt-1 shrink-0 text-red-700"
            />

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                CareAI cannot save data in this browser
              </h1>

              <p className="mt-2 text-lg text-slate-700">
                {error}
              </p>

              <p className="mt-2 text-lg text-slate-700">
                Private browsing windows often block local storage.
                Try a normal window, or another browser.
              </p>
            </div>
          </div>
        ) : (
          <Spinner label="Loading your CareAI data…" />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Authenticated Application                                                  */
/* -------------------------------------------------------------------------- */

function AuthenticatedApp() {
  const { currentUser } = useApp();

  const [view, setView] = useState<AppView>('dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  useReminderExpiry();

  if (!currentUser) {
    return <AuthFlow />;
  }

  const isElder = currentUser.role === 'elder';

  return (
    <div className="min-h-screen bg-slate-100">
      <Header
        view={view}
        onChangeView={setView}
        onOpenEmergency={() => setEmergencyOpen(true)}
      />

      <main className="mx-auto w-full max-w-7xl px-4 pb-40 pt-8 sm:px-6">
        {view === 'profile' ? (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ) : isElder ? (
          <ProtectedRoute role="elder">
            <ElderlyDashboard
              onOpenChat={() => setChatOpen(true)}
            />
          </ProtectedRoute>
        ) : (
          <ProtectedRoute role="caretaker">
            <CaregiverDashboard />
          </ProtectedRoute>
        )}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Persistent CareAI Button                                           */}
      {/* ------------------------------------------------------------------ */}

      <button
        type="button"
        onClick={() => setChatOpen(true)}
        aria-label={
          isElder
            ? 'Talk to CareAI assistant'
            : 'Open CareAI assistant'
        }
        className="
          fixed bottom-6 right-4 z-40
          flex h-20 items-center gap-3
          rounded-2xl
          border-2 border-slate-900
          bg-slate-900
          px-6
          text-xl font-semibold
          text-white
          shadow-2xl
          transition
          hover:bg-slate-800
          focus:outline-none
          focus:ring-4
          focus:ring-emerald-300
          sm:right-6
        "
      >
        <MessageCircle
          aria-hidden="true"
          size={28}
        />

        {isElder ? 'Talk to CareAI' : 'CareAI'}
      </button>

      {/* ------------------------------------------------------------------ */}
      {/* Drawers / Modals                                                   */}
      {/* ------------------------------------------------------------------ */}

      <CareAIChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      <EmergencyContactModal
        open={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                             */}
      {/* ------------------------------------------------------------------ */}

      <footer className="border-t-2 border-slate-200 bg-white px-4 py-8 text-base text-slate-600 sm:px-6">
        <p className="mx-auto max-w-4xl">
          CareAI is a local demo. Sign-in is not production-grade
          authentication, no medical diagnosis or prescription reading
          happens here, no emergency service is connected, and every
          record lives in this browser on this device only.
        </p>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Application Shell                                                          */
/* -------------------------------------------------------------------------- */

function AppShell() {
  const {
    ready,
    loadError,
    currentUser,
  } = useApp();

  if (!ready || loadError) {
    return <BootScreen error={loadError} />;
  }

  if (!currentUser) {
    return <AuthFlow />;
  }

  return <AuthenticatedApp />;
}

/* -------------------------------------------------------------------------- */
/* Root Application                                                           */
/* -------------------------------------------------------------------------- */

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppShell />
        <ToastViewport />
      </AppProvider>
    </ToastProvider>
  );
}
