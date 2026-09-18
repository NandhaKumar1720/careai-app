import { useState } from 'react';
import { Link2, Link2Off, UserCheck } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { TextField } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ProfileAvatar } from './ProfileAvatar';
import { useApp } from '../../hooks/useApp';
import { useToast } from '../../hooks/useToast';

export function CaretakerConnectCard() {
  const {
    currentUser,
    caretakerForElder,
    connectElderToCaretaker,
    disconnectCaretaker,
    avatars,
  } = useApp();

  const { notify } = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  if (!currentUser || currentUser.role !== 'elder') return null;

  const caretaker = caretakerForElder(currentUser.id);

  async function handleConnect() {
    setError(undefined);
    setBusy(true);

    const result = await connectElderToCaretaker(code);

    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setCode('');
    notify(
      'success',
      'Caretaker connected',
      `${result.data.fullName} can now see your schedule.`,
    );
  }

  async function handleDisconnect() {
    setDisconnecting(true);

    const result = await disconnectCaretaker();

    setDisconnecting(false);

    if (!result.ok) {
      notify(
        'error',
        'Could not disconnect',
        result.error ||
          "We couldn't disconnect the caretaker. Please try again.",
        true,
      );
      return;
    }

    setConfirmingDisconnect(false);

    notify(
      'warning',
      'Caretaker disconnected',
      'Caretaker disconnected successfully.',
      true,
    );
  }

  if (caretaker) {
    return (
      <Card>
        <CardHeader
          title="Your caretaker"
          icon={<UserCheck aria-hidden="true" size={28} />}
        />

        <div className="flex flex-wrap items-center gap-5">
          <ProfileAvatar
            name={caretaker.fullName}
            dataUrl={
              caretaker.avatarId
                ? avatars[caretaker.avatarId] ?? null
                : null
            }
            size="lg"
          />

          <div>
            <p className="text-2xl font-bold text-black">
              {caretaker.fullName}
            </p>

            <p className="text-lg text-neutral-700">
              @{caretaker.username}
            </p>

            <p className="text-lg text-neutral-700">
              {caretaker.phone}
            </p>
          </div>

          <Button
            variant="secondary"
            size="md"
            className="sm:ml-auto"
            onClick={() => setConfirmingDisconnect(true)}
            icon={<Link2Off aria-hidden="true" size={22} />}
          >
            Disconnect
          </Button>
        </div>

        <Modal
          open={confirmingDisconnect}
          onClose={() => {
            if (!disconnecting) setConfirmingDisconnect(false);
          }}
          title="Disconnect your caretaker?"
          description={`${caretaker.fullName} will stop seeing your medicines, reminders and alerts.`}
          footer={
            <>
              <Button
                variant="secondary"
                size="lg"
                disabled={disconnecting}
                onClick={() => setConfirmingDisconnect(false)}
              >
                Keep connected
              </Button>

              <Button
                variant="danger"
                size="lg"
                disabled={disconnecting}
                onClick={() => void handleDisconnect()}
              >
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </Button>
            </>
          }
        >
          <p className="text-lg text-neutral-700">
            You can reconnect later with the same code, as long as they still
            have room for another elder.
          </p>
        </Modal>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Connect with your caretaker"
        description="Enter the code your caretaker gave you. They will then see your schedule and any missed doses."
        icon={<Link2 aria-hidden="true" size={28} />}
      />

      <div className="space-y-5">
        <TextField
          label="Caretaker code"
          value={code}
          error={error}
          placeholder="CARE-7F29K4"
          onChange={(event) => setCode(event.target.value.toUpperCase())}
        />

        <Button
          size="lg"
          onClick={() => void handleConnect()}
          disabled={busy || !code.trim()}
        >
          {busy ? 'Connecting…' : 'Connect'}
        </Button>
      </div>
    </Card>
  );
}
