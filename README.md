# CareAI — Smart Elderly Healthcare Assistant

A senior-first React + TypeScript frontend for medication reminders (elder) and
adherence monitoring (caretaker). Everything runs locally in the browser: no
server, no API keys, no network calls.

## Setup

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run build       # type-check + production build
npm run preview     # serve the production build
```

Dependencies are already listed in `package.json`. If you prefer to install them
explicitly:

```bash
npm install react react-dom lucide-react
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom \
  tailwindcss postcss autoprefixer
```

## Demo accounts (seeded on first run)

| Role      | Email               | Password    |
|-----------|---------------------|-------------|
| Caretaker | meera@careai.demo   | caretaker1  |
| Elder     | ravi@careai.demo    | elderpass1  |
| Elder     | lakshmi@careai.demo | elderpass2  |

The seeded caretaker code is `CARE-7F29K4`.

## Project structure

```
careai/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── components/
    │   ├── auth/
    │   │   ├── AuthLayout.tsx
    │   │   ├── ForgotPasswordPage.tsx
    │   │   ├── LoginPage.tsx
    │   │   └── SignupPage.tsx
    │   ├── profile/
    │   │   ├── AvatarPicker.tsx
    │   │   ├── CaretakerConnectCard.tsx
    │   │   ├── EditProfileModal.tsx
    │   │   ├── ProfileAvatar.tsx
    │   │   └── ProfilePage.tsx
    │   ├── ui/
    │   │   ├── Badge.tsx
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── Input.tsx
    │   │   ├── Modal.tsx
    │   │   ├── ProgressBar.tsx
    │   │   ├── Spinner.tsx
    │   │   └── ToastViewport.tsx
    │   ├── AddMedicineModal.tsx
    │   ├── AdherenceAuditTrail.tsx
    │   ├── CareAIChatDrawer.tsx
    │   ├── CaregiverDashboard.tsx
    │   ├── ElderSummaryCard.tsx
    │   ├── ElderlyDashboard.tsx
    │   ├── EmergencyContactModal.tsx
    │   ├── EscalationBanners.tsx
    │   ├── Header.tsx
    │   ├── MedicineCard.tsx
    │   ├── PrescriptionParseModal.tsx
    │   ├── ProtectedRoute.tsx
    │   └── ReminderModal.tsx
    ├── context/
    │   ├── AppContext.tsx
    │   └── ToastContext.tsx
    ├── data/
    │   └── mockData.ts
    ├── hooks/
    │   ├── useApp.ts
    │   ├── useAuth.ts
    │   ├── useNow.ts
    │   ├── useReminderExpiry.ts
    │   └── useToast.ts
    ├── lib/
    │   ├── storage/
    │   │   ├── alertRepository.ts
    │   │   ├── avatarRepository.ts
    │   │   ├── chatRepository.ts
    │   │   ├── database.ts
    │   │   ├── medicineRepository.ts
    │   │   ├── relationshipRepository.ts
    │   │   ├── reminderRepository.ts
    │   │   ├── settingsRepository.ts
    │   │   └── userRepository.ts
    │   ├── auth.ts
    │   ├── careai.ts
    │   ├── caretakerCode.ts
    │   ├── ids.ts
    │   ├── image.ts
    │   ├── medication.ts
    │   └── validation.ts
    ├── types/
    │   └── index.ts
    └── utils/
        ├── accessibility.ts
        ├── date.ts
        └── formatting.ts
```

### Two deviations from the suggested structure

- **No separate `AuthContext.tsx`.** Sign-up has to read medicines, relationships
  and caretaker capacity, so a second provider would have to read the first one's
  state. Auth lives in `AppContext`, and `hooks/useAuth.ts` exposes just the auth
  slice for components that only need it.
- **Extra files**: `lib/image.ts` (client-side image validation and compression),
  `lib/careai.ts` (deterministic assistant replies), `hooks/useNow.ts` (a shared
  ticking clock so countdowns stay honest), `context/ToastContext.tsx` and
  `components/ui/*` (the shared visual patterns).

## How persistence works

A browser React app cannot rewrite `src/data/mockData.ts` at runtime, so:

- `mockData.ts` holds **seed data only**.
- On first launch, `AppContext` copies the seed into IndexedDB and flips a
  `seeded` flag in the settings store.
- On every later launch it loads from IndexedDB. Seed data never overwrites
  runtime data.
- All IndexedDB access goes through `src/lib/storage/` — typed repositories for
  users, medicines, reminder logs, alerts, relationships, chat, avatars and
  settings. No component touches IndexedDB directly.

Profile pictures are downscaled to 320 px and stored as compressed JPEG data
URLs in their own object store.

## The one-hour reminder rule

A dose scheduled for 8:00 PM becomes answerable at 8:00 PM and expires at
9:00 PM. Expiry is computed from the scheduled time (`src/utils/date.ts`), never
from page visibility. At expiry the medicine flips to `missed`, the buttons
disappear, the card greys out, a reminder log is written and a critical caregiver
alert is raised. `useReminderExpiry()` re-checks every 30 seconds, on tab focus,
and once on start-up — so a window that lapsed while the browser was closed is
still recorded.

Statuses roll over at midnight: a status belongs to a specific date
(`statusDate`), and anything older resets to `scheduled`.

## Feature verification checklist

- [x] Login with role selection, show/hide password, remember me
- [x] Signup with profile picture, emergency contact and optional caretaker code
- [x] Forgot password — email → on-screen reset code → new password → login
- [x] Unique username (normalised, case-insensitive)
- [x] Unique email (lowercased before comparison)
- [x] Unique phone (digits only, optional leading `+`)
- [x] Unique caretaker code, generated without collisions
- [x] Maximum 3 elders per caretaker, enforced at signup and at connect time
- [x] Elder ↔ caretaker connection, with disconnect behind a confirmation dialog
- [x] Profile editing with duplicate checks
- [x] Profile image upload, replace, remove and persistence
- [x] Medicine creation and editing, with validation
- [x] Reminder modal with 80 px action buttons, focus trap and Escape to close
- [x] One-hour reminder expiry calculated from the scheduled time
- [x] Automatic `missed` status, disabled buttons, greyed card, audit log
- [x] Caregiver alerts with critical / warning / informational escalation
- [x] Adherence dashboard: rate, taken, missed, pending, total, progress bars
- [x] Timestamped audit trail — table on desktop, cards on mobile
- [x] CareAI drawer with the exact safety banner and quick prompts
- [x] Dosage-safety response for "can I take two tablets" style questions
- [x] Emergency contact with confirmation before a `tel:` call
- [x] Local persistence across refresh and browser restart
- [x] Responsive from 320 px upward, no horizontal scrolling
- [x] Accessibility: semantic HTML, labels, `aria-live`, visible focus rings,
      icon + text for every status, reduced-motion support
- [x] Keyboard navigation throughout, including modals and the chat drawer

## Demo limitations — please read

- Local sign-in is **not** production-grade authentication. Passwords are hashed
  with SHA-256 and a fixed salt in the browser; there is no server, no rate
  limiting and no secret. Do not reuse a real password.
- No medical diagnosis, symptom checking or dosage advice happens anywhere in
  this app. CareAI answers schedule questions from stored data only.
- Prescription parsing is simulated. No OCR runs, and the extracted values are
  fixed examples.
- No emergency service is integrated. The emergency button opens your phone app
  after you confirm.
- IndexedDB data belongs to the current browser and device. Clearing site data
  deletes everything, and nothing syncs between devices.
- No claim of HIPAA, GDPR or any other compliance is made.

## Not yet verified

The project was written offline, so `npm install` and `npm run typecheck` have
not been run against it. Run `npm run typecheck` first — it is the fastest way to
catch anything that slipped through.
