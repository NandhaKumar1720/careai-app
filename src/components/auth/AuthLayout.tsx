import type { ReactNode } from 'react';
import { HeartPulse, ShieldCheck } from 'lucide-react';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:gap-16 lg:px-10 lg:py-12">

        {/* ============================================================ */}
        {/* Left / Branding Section                                      */}
        {/* ============================================================ */}

        <header className="lg:w-2/5">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <span
              className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border-2
                border-black
                bg-black
                text-white
                shadow-lg
              "
            >
              <HeartPulse
                aria-hidden="true"
                size={34}
                strokeWidth={2.5}
              />
            </span>

            <div>
              <p className="text-3xl font-black tracking-tight text-black">
                CareAI
              </p>

              <p className="mt-1 text-base font-semibold leading-6 text-neutral-600 sm:text-lg">
                Smart elderly healthcare assistant
              </p>
            </div>
          </div>

          {/* Heading */}
          <h1
            className="
              mt-8
              text-4xl
              font-black
              leading-tight
              tracking-tight
              text-black
              sm:text-5xl
            "
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p
            className="
              mt-5
              max-w-prose
              text-lg
              font-medium
              leading-8
              text-neutral-700
              sm:text-xl
            "
          >
            {subtitle}
          </p>

          {/* Local Demo / Privacy Notice */}
          <div
            className="
              mt-8
              flex
              items-start
              gap-4
              rounded-2xl
              border-2
              border-black
              bg-neutral-100
              p-5
              text-black
              shadow-sm
            "
          >
            <span
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-black
                text-white
              "
            >
              <ShieldCheck
                aria-hidden="true"
                size={25}
                strokeWidth={2.5}
              />
            </span>

            <p className="text-base font-semibold leading-7 text-neutral-800">
              Local demo sign-in. Accounts, passwords and
              health data stay in this browser only — there is
              no server, no email delivery and no medical
              service behind it.
            </p>
          </div>
        </header>

        {/* ============================================================ */}
        {/* Right / Authentication Card                                  */}
        {/* ============================================================ */}

        <main className="w-full lg:w-3/5">
          <div
            className="
              rounded-[2rem]
              border-2
              border-black
              bg-white
              p-6
              shadow-2xl
              sm:p-8
              lg:p-10
            "
          >
            {children}
          </div>

          {footer ? (
            <div className="mt-6">
              {footer}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
