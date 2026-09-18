import { useState } from 'react';
import { Check, Copy, Pencil, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { ProfileAvatar } from './ProfileAvatar';
import { EditProfileModal } from './EditProfileModal';
import { CaretakerConnectCard } from './CaretakerConnectCard';
import { useApp } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';
import { MAX_ELDERS_PER_CARETAKER } from '../../lib/caretakerCode';

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b-2 border-neutral-200 py-4 last:border-b-0">
      <dt className="text-lg text-neutral-700">{label}</dt>
      <dd className="text-xl font-semibold text-black">
        {value || 'Not set'}
      </dd>
    </div>
  );
}

export function ProfilePage() {
  const {
    currentUser,
    avatars,
    eldersForCaretaker,
    regenerateCaretakerCode,
  } = useApp();

  const { notify } = useToast();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!currentUser) return null;

  const avatarUrl = currentUser.avatarId
    ? avatars[currentUser.avatarId] ?? null
    : null;

  const isCaretaker = currentUser.role === 'caretaker';
  const elders = isCaretaker
    ? eldersForCaretaker(currentUser.id)
    : [];

  async function copyCode() {
    const code = currentUser?.caretakerCode;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 4000);
    } catch {
      notify('info', 'Copy the code by hand', code);
    }
  }

  async function regenerate() {
    const result = await regenerateCaretakerCode();

    if (!result.ok) {
      notify('warning', 'Code not changed', result.error, true);
      return;
    }

    notify(
      'success',
      'New code created',
      `Share ${result.data} with the elders you look after.`,
      true,
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-wrap items-center gap-6">
          <ProfileAvatar
            name={currentUser.fullName}
            dataUrl={avatarUrl}
            size="xl"
          />

          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-black sm:text-4xl">
              {currentUser.fullName}
            </h1>

            <p className="text-xl text-neutral-700">
              @{currentUser.username}
            </p>

            <p className="mt-2 text-lg font-semibold text-black">
              {isCaretaker ? 'Caretaker account' : 'Elder account'}
            </p>
          </div>

          <Button
            className="sm:ml-auto"
            size="md"
            onClick={() => setEditing(true)}
            icon={<Pencil aria-hidden="true" size={22} />}
          >
            Edit profile
          </Button>
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader title="Your details" />

          <dl>
            <DetailRow
              label="Email address"
              value={currentUser.email}
            />

            <DetailRow
              label="Phone number"
              value={currentUser.phone}
            />

            <DetailRow
              label="Age"
              value={currentUser.age ? String(currentUser.age) : ''}
            />

            <DetailRow
              label="Emergency contact"
              value={currentUser.emergencyContactName}
            />

            <DetailRow
              label="Emergency phone"
              value={currentUser.emergencyContactPhone}
            />
          </dl>
        </Card>

        {isCaretaker ? (
          <Card>
            <CardHeader
              title="Your CareAI connection code"
              description="An elder types this code into their profile to link with you."
              icon={<ShieldCheck aria-hidden="true" size={28} />}
            />

            <p className="rounded-2xl border-2 border-black bg-neutral-100 p-6 text-center text-4xl font-bold tracking-[0.2em] text-black">
              {currentUser.caretakerCode}
            </p>

            <div className="mt-5 flex flex-wrap gap-4">
              <Button
                size="md"
                variant="secondary"
                onClick={() => void copyCode()}
                icon={
                  copied ? (
                    <Check aria-hidden="true" size={22} />
                  ) : (
                    <Copy aria-hidden="true" size={22} />
                  )
                }
              >
                {copied ? 'Code copied' : 'Copy code'}
              </Button>

              {elders.length === 0 ? (
                <Button
                  size="md"
                  variant="ghost"
                  onClick={() => void regenerate()}
                  icon={<RefreshCw aria-hidden="true" size={22} />}
                >
                  Create a new code
                </Button>
              ) : null}
            </div>

            <p aria-live="polite" className="care-help">
              {copied ? 'The code is on your clipboard.' : ' '}
            </p>

            <p className="mt-4 flex items-center gap-2 text-lg text-neutral-700">
              <Users aria-hidden="true" size={22} />
              {elders.length} of {MAX_ELDERS_PER_CARETAKER} elder places used.
            </p>
          </Card>
        ) : (
          <CaretakerConnectCard />
        )}
      </div>

      {editing ? (
        <EditProfileModal
          open
          onClose={() => setEditing(false)}
        />
      ) : null}
    </div>
  );
}
