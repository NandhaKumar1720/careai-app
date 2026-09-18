import {
  HeartPulse,
  LogOut,
  Menu,
  PhoneCall,
  Stethoscope,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { ProfileAvatar } from './profile/ProfileAvatar';
import { Button } from './ui/Button';
import { useApp } from '../hooks/useApp';

export type AppView = 'dashboard' | 'profile';

export function Header({
  view,
  onChangeView,
  onOpenEmergency,
}: {
  view: AppView;
  onChangeView: (view: AppView) => void;
  onOpenEmergency: () => void;
}) {
  const { currentUser, avatars, logout, eldersForCaretaker } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!currentUser) return null;

  const avatarUrl = currentUser.avatarId
    ? avatars[currentUser.avatarId] ?? null
    : null;

  const isCaretaker = currentUser.role === 'caretaker';
  const elderCount = isCaretaker
    ? eldersForCaretaker(currentUser.id).length
    : 0;

  const navButtons = (
    <>
      <Button
        variant={view === 'dashboard' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => {
          onChangeView('dashboard');
          setMenuOpen(false);
        }}
        aria-current={view === 'dashboard' ? 'page' : undefined}
        icon={
          isCaretaker ? (
            <Users aria-hidden="true" size={20} />
          ) : (
            <Stethoscope aria-hidden="true" size={20} />
          )
        }
      >
        Dashboard
      </Button>

      <Button
        variant={view === 'profile' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => {
          onChangeView('profile');
          setMenuOpen(false);
        }}
        aria-current={view === 'profile' ? 'page' : undefined}
        icon={<UserIcon aria-hidden="true" size={20} />}
      >
        Profile
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setMenuOpen(false);
          void logout();
        }}
        icon={<LogOut aria-hidden="true" size={20} />}
      >
        Sign out
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
            <HeartPulse aria-hidden="true" size={30} />
          </span>

          <div>
            <p className="text-2xl font-bold leading-tight text-black">
              CareAI
            </p>

            <p className="text-base text-neutral-700">
              {isCaretaker
                ? `Caretaker${elderCount ? `, caring for ${elderCount}` : ''}`
                : 'Elder'}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button
            variant="danger"
            size="md"
            onClick={onOpenEmergency}
            icon={<PhoneCall aria-hidden="true" size={24} />}
            className="px-4 sm:px-6"
          >
            <span className="hidden sm:inline">Emergency contact</span>
            <span className="sm:hidden">Emergency</span>
          </Button>

          <div className="hidden items-center gap-3 lg:flex">
            {navButtons}
          </div>

          <button
            type="button"
            onClick={() => onChangeView('profile')}
            className="flex items-center gap-3 rounded-2xl border-2 border-black px-3 py-2 hover:bg-neutral-100"
            aria-label={`Open profile for ${currentUser.fullName}`}
          >
            <ProfileAvatar
              name={currentUser.fullName}
              dataUrl={avatarUrl}
              size="sm"
            />

            <span className="hidden text-left sm:block">
              <span className="block text-lg font-semibold leading-tight text-black">
                {currentUser.fullName}
              </span>

              <span className="block text-base leading-tight text-neutral-700">
                @{currentUser.username}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-controls="header-menu"
            aria-label="Open menu"
            className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black text-black hover:bg-neutral-100 lg:hidden"
          >
            <Menu aria-hidden="true" size={26} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="header-menu"
          className="border-t-2 border-black bg-neutral-100 px-4 py-4 lg:hidden"
        >
          <div className="flex flex-col gap-3">
            {navButtons}
          </div>
        </div>
      ) : null}
    </header>
  );
}
