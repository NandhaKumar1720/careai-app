import { useState } from 'react';
import { Phone, PhoneCall, ShieldAlert } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useApp } from '../hooks/useApp';
import { telHref } from '../utils/formatting';

export function EmergencyContactModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser, caretakerForElder } = useApp();
  const [confirming, setConfirming] = useState(false);

  if (!currentUser) return null;

  const caretaker = currentUser.role === 'elder' ? caretakerForElder(currentUser.id) : null;
  const contactName = currentUser.emergencyContactName || caretaker?.fullName || 'No contact saved';
  const contactPhone = currentUser.emergencyContactPhone || caretaker?.phone || '';

  function handleClose() {
    setConfirming(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Emergency contact"
      description="CareAI never places a call on its own. You choose when to call."
      size="md"
      footer={
        <>
          <Button variant="secondary" size="lg" onClick={handleClose}>
            Cancel
          </Button>
          {contactPhone ? (
            confirming ? (
              <a
                href={telHref(contactPhone)}
                className="inline-flex h-20 items-center justify-center gap-3 rounded-2xl border-2 border-red-600 bg-red-600 px-8 text-xl font-semibold text-white shadow-lg hover:bg-red-700"
              >
                <PhoneCall aria-hidden="true" size={26} />
                Call {contactName.split(' ')[0]} now
              </a>
            ) : (
              <Button variant="danger" size="lg" onClick={() => setConfirming(true)} icon={<Phone aria-hidden="true" size={26} />}>
                Call this contact
              </Button>
            )
          ) : null}
        </>
      }
    >
      <div className="rounded-2xl border-2 border-red-600 bg-red-50 p-6">
        <div className="flex items-start gap-4">
          <ShieldAlert aria-hidden="true" size={36} className="mt-1 shrink-0 text-red-700" />
          <div>
            <p className="text-2xl font-bold text-slate-900">{contactName}</p>
            <p className="mt-1 text-xl text-slate-800">{contactPhone || 'Add a phone number in your profile.'}</p>
          </div>
        </div>
      </div>

      {caretaker && caretaker.phone !== contactPhone ? (
        <p className="text-lg text-slate-700">
          Your caretaker {caretaker.fullName} can also be reached on {caretaker.phone}.
        </p>
      ) : null}

      <p aria-live="polite" className="text-lg text-slate-700">
        {confirming
          ? 'Tap the red button again to open your phone app and start the call.'
          : 'CareAI is not connected to any emergency service. For a medical emergency, use your local emergency number.'}
      </p>
    </Modal>
  );
}
