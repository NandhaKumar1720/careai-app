import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  HeartPulse,
  LockKeyhole,
  MessageCircleHeart,
  Pill,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

const features = [
  {
    icon: Pill,
    title: 'Medicine Reminders',
    description:
      'Clear, easy-to-understand reminders help seniors stay on track with their daily medication schedule.',
  },
  {
    icon: UsersRound,
    title: 'Family & Caregiver Support',
    description:
      'Connect with a trusted caretaker and keep them informed about medication adherence and alerts.',
  },
  {
    icon: MessageCircleHeart,
    title: 'CareAI Assistant',
    description:
      'Ask CareAI about your schedule, upcoming medicines, and reminder history in simple language.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety First',
    description:
      'CareAI is designed as a schedule assistant and does not diagnose conditions or change medication doses.',
  },
];

const benefits = [
  'Large, senior-friendly controls',
  'Simple medication schedules',
  'Caretaker monitoring',
  'Smart missed-dose alerts',
  'Accessible and responsive design',
  'Private local data storage',
];

export default function LandingPage({
  onLogin,
  onSignup,
}: LandingPageProps) {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* ================================================================== */}
      {/* Navigation                                                         */}
      {/* ================================================================== */}

      <header className="sticky top-0 z-40 border-b-2 border-black bg-white">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Logo */}
          <button
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            }
            className="
              flex items-center gap-3 rounded-xl
              focus:outline-none
              focus:ring-4
              focus:ring-black
              focus:ring-offset-2
            "
            aria-label="CareAI home"
          >
            <span
              className="
                flex h-12 w-12 items-center justify-center
                rounded-2xl
                border-2 border-black
                bg-black
                text-white
              "
            >
              <HeartPulse
                size={27}
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </span>

            <span>
              <span className="block text-xl font-extrabold tracking-tight text-black">
                CareAI
              </span>

              <span className="hidden text-xs font-semibold text-neutral-600 sm:block">
                Smart Elderly Healthcare Assistant
              </span>
            </span>
          </button>

          {/* Navigation buttons */}
          <nav
            className="flex items-center gap-2 sm:gap-3"
            aria-label="Main navigation"
          >
            <button
              type="button"
              onClick={onLogin}
              className="
                min-h-12
                rounded-xl
                border-2 border-transparent
                px-4
                text-base
                font-bold
                text-black
                transition
                hover:border-black
                hover:bg-neutral-100
                focus:outline-none
                focus:ring-4
                focus:ring-black
                focus:ring-offset-2
                sm:px-6
              "
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={onSignup}
              className="
                min-h-12
                rounded-xl
                border-2 border-black
                bg-black
                px-4
                text-base
                font-bold
                text-white
                shadow-md
                transition
                hover:bg-neutral-800
                focus:outline-none
                focus:ring-4
                focus:ring-black
                focus:ring-offset-2
                sm:px-6
              "
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* ================================================================== */}
      {/* Hero Section                                                       */}
      {/* ================================================================== */}

      <section className="border-b-2 border-black bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:px-10 lg:py-28">
          {/* Hero copy */}
          <div>
            <div
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border-2 border-black
                bg-neutral-100
                px-4
                py-2
                text-sm
                font-bold
                text-black
              "
            >
              <CheckCircle2
                size={18}
                aria-hidden="true"
              />
              Built for simpler everyday care
            </div>

            <h1
              className="
                max-w-3xl
                text-4xl
                font-black
                leading-tight
                tracking-tight
                text-black
                sm:text-5xl
                lg:text-6xl
              "
            >
              Healthcare support that feels{' '}
              <span className="underline decoration-4 underline-offset-8">
                simple.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700 sm:text-xl">
              CareAI helps elderly users manage medicine reminders while
              keeping trusted caretakers informed. Everything is designed to
              be clear, accessible, and easy to use.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onSignup}
                className="
                  flex
                  min-h-16
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  border-2 border-black
                  bg-black
                  px-7
                  text-lg
                  font-extrabold
                  text-white
                  shadow-lg
                  transition
                  hover:-translate-y-0.5
                  hover:bg-neutral-800
                  focus:outline-none
                  focus:ring-4
                  focus:ring-black
                  focus:ring-offset-2
                "
              >
                Create Your Account
                <ArrowRight
                  size={22}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={onLogin}
                className="
                  flex
                  min-h-16
                  items-center
                  justify-center
                  rounded-2xl
                  border-2 border-black
                  bg-white
                  px-7
                  text-lg
                  font-extrabold
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
                I Already Have an Account
              </button>
            </div>

            {/* Local storage message */}
            <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-neutral-600">
              <LockKeyhole
                size={18}
                aria-hidden="true"
              />
              Your data stays stored locally on your device.
            </div>
          </div>

          {/* ============================================================ */}
          {/* Dashboard Preview                                            */}
          {/* ============================================================ */}

          <div className="relative mx-auto w-full max-w-xl">
            <div
              className="
                rounded-[2rem]
                border-2 border-black
                bg-neutral-100
                p-4
                shadow-2xl
                sm:p-6
              "
            >
              <div
                className="
                  rounded-3xl
                  border-2 border-black
                  bg-white
                  p-5
                  shadow-lg
                  sm:p-7
                "
              >
                {/* Dashboard heading */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-neutral-500">
                      Good morning
                    </p>

                    <h2 className="mt-1 text-2xl font-extrabold text-black">
                      Your Care Dashboard
                    </h2>
                  </div>

                  <div
                    className="
                      flex h-12 w-12
                      shrink-0
                      items-center justify-center
                      rounded-2xl
                      border-2 border-black
                      bg-neutral-100
                      text-black
                    "
                  >
                    <HeartPulse
                      size={25}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Next medicine */}
                <div
                  className="
                    mt-6
                    rounded-2xl
                    border-2 border-black
                    bg-black
                    p-5
                    text-white
                    shadow-lg
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold tracking-wide text-neutral-300">
                        NEXT MEDICINE
                      </p>

                      <h3 className="mt-1 text-2xl font-extrabold">
                        Amlodipine
                      </h3>

                      <p className="mt-1 text-lg font-semibold text-neutral-300">
                        5 mg · 8:00 AM
                      </p>
                    </div>

                    <Pill
                      size={32}
                      aria-hidden="true"
                    />
                  </div>

                  <button
                    type="button"
                    disabled
                    className="
                      mt-5
                      flex
                      min-h-14
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border-2 border-white
                      bg-white
                      text-base
                      font-extrabold
                      text-black
                    "
                    aria-label="Medicine reminder preview"
                  >
                    <BellRing
                      size={20}
                      aria-hidden="true"
                    />
                    Medicine Reminder
                  </button>
                </div>

                {/* Dashboard metrics */}
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border-2 border-black bg-white p-4">
                    <p className="text-sm font-semibold text-neutral-500">
                      Today's Medicines
                    </p>

                    <p className="mt-2 text-3xl font-black text-black">
                      4
                    </p>
                  </div>

                  <div className="rounded-2xl border-2 border-black bg-white p-4">
                    <p className="text-sm font-semibold text-neutral-500">
                      Adherence
                    </p>

                    <p className="mt-2 text-3xl font-black text-black">
                      92%
                    </p>
                  </div>
                </div>

                {/* Dashboard status */}
                <div className="mt-5 flex items-center gap-3 rounded-2xl border-2 border-black bg-neutral-100 p-4">
                  <div
                    className="
                      flex h-10 w-10
                      shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-black
                      text-white
                    "
                  >
                    <CheckCircle2
                      size={21}
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-neutral-500">
                      TODAY'S STATUS
                    </p>

                    <p className="text-base font-extrabold text-black">
                      All reminders on track
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating caregiver card */}
            <div
              className="
                absolute
                -bottom-5
                -left-3
                hidden
                rounded-2xl
                border-2 border-black
                bg-white
                p-4
                shadow-xl
                sm:block
                lg:-left-8
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    bg-black
                    text-white
                  "
                >
                  <ShieldCheck
                    size={23}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-neutral-500">
                    Caregiver connected
                  </p>

                  <p className="text-base font-extrabold text-black">
                    Care & Safety
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Features Section                                                  */}
      {/* ================================================================== */}

      <section
        id="features"
        className="border-b-2 border-black bg-neutral-100 px-5 py-16 sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-base font-extrabold uppercase tracking-wider text-black">
              Designed around people
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-black sm:text-4xl">
              Everything important, without the complexity.
            </h2>

            <p className="mt-5 text-lg leading-8 text-neutral-700">
              CareAI brings medication reminders, caretaker supervision, and
              an easy-to-use assistant together in one simple experience.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="
                    rounded-3xl
                    border-2 border-black
                    bg-white
                    p-6
                    shadow-sm
                    transition
                    hover:-translate-y-1
                    hover:shadow-xl
                  "
                >
                  <div
                    className="
                      flex h-14 w-14
                      items-center justify-center
                      rounded-2xl
                      border-2 border-black
                      bg-black
                      text-white
                    "
                  >
                    <Icon
                      size={27}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-extrabold text-black">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-base leading-7 text-neutral-700">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Benefits Section                                                   */}
      {/* ================================================================== */}

      <section className="border-b-2 border-black bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-base font-extrabold uppercase tracking-wider text-black">
              Senior-first experience
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-black sm:text-4xl">
              Made for clarity, confidence, and everyday independence.
            </h2>

            <p className="mt-5 text-lg leading-8 text-neutral-700">
              From large medication buttons to simple caretaker connections,
              CareAI focuses on reducing unnecessary complexity for older
              adults and their families.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border-2 border-black
                    bg-neutral-50
                    p-4
                  "
                >
                  <CheckCircle2
                    className="shrink-0 text-black"
                    size={23}
                    aria-hidden="true"
                  />

                  <span className="text-base font-bold text-black">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CareAI safety card */}
          <div
            className="
              rounded-[2rem]
              border-2 border-black
              bg-black
              p-6
              text-white
              shadow-2xl
              sm:p-8
            "
          >
            <div
              className="
                flex h-14 w-14
                items-center justify-center
                rounded-2xl
                border-2 border-white
                bg-white
                text-black
              "
            >
              <MessageCircleHeart
                size={28}
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-6 text-2xl font-extrabold sm:text-3xl">
              A helpful assistant, with safety boundaries.
            </h3>

            <p className="mt-4 text-lg leading-8 text-neutral-300">
              CareAI can help users understand their medication schedule and
              reminders, while keeping medical decisions with qualified
              healthcare professionals.
            </p>

            <div
              className="
                mt-6
                rounded-2xl
                border-2 border-white
                bg-neutral-900
                p-5
              "
            >
              <p className="text-lg font-bold leading-8 text-white">
                “CareAI is a schedule assistant. It cannot diagnose or change
                dosages.”
              </p>
            </div>

            <button
              type="button"
              onClick={onSignup}
              className="
                mt-7
                flex
                min-h-16
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                border-2 border-white
                bg-white
                px-6
                text-lg
                font-extrabold
                text-black
                shadow-lg
                transition
                hover:bg-neutral-200
                focus:outline-none
                focus:ring-4
                focus:ring-white
                focus:ring-offset-2
                focus:ring-offset-black
              "
            >
              Get Started with CareAI

              <ArrowRight
                size={22}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Final CTA                                                          */}
      {/* ================================================================== */}

      <section className="border-b-2 border-black bg-neutral-100 px-5 py-16 text-black sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div
            className="
              mx-auto
              flex h-16 w-16
              items-center justify-center
              rounded-2xl
              border-2 border-black
              bg-black
              text-white
            "
          >
            <HeartPulse
              size={31}
              aria-hidden="true"
            />
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
            Ready to make everyday medication management simpler?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
            Create your CareAI account and connect with the people who help
            support your care.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onSignup}
              className="
                min-h-16
                rounded-2xl
                border-2 border-black
                bg-black
                px-8
                text-lg
                font-extrabold
                text-white
                shadow-lg
                transition
                hover:bg-neutral-800
                focus:outline-none
                focus:ring-4
                focus:ring-black
                focus:ring-offset-2
              "
            >
              Create an Account
            </button>

            <button
              type="button"
              onClick={onLogin}
              className="
                min-h-16
                rounded-2xl
                border-2 border-black
                bg-white
                px-8
                text-lg
                font-extrabold
                text-black
                transition
                hover:bg-neutral-200
                focus:outline-none
                focus:ring-4
                focus:ring-black
                focus:ring-offset-2
              "
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* Footer                                                             */}
      {/* ================================================================== */}

      <footer className="bg-black px-5 py-8 text-neutral-400 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                border-2 border-white
                bg-white
                text-black
              "
            >
              <HeartPulse
                size={21}
                aria-hidden="true"
              />
            </span>

            <span className="font-bold text-white">
              CareAI
            </span>
          </div>

          <p className="text-sm">
            Smart elderly healthcare assistance.
          </p>
        </div>
      </footer>
    </main>
  );
}
