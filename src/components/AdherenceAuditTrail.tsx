import { History } from 'lucide-react';
import type { ReminderLog, User } from '../types';
import { Card, CardHeader } from './ui/Card';
import { StatusBadge } from './ui/Badge';
import { EmptyState } from './ui/EmptyState';
import { formatTime12, formatTimestamp } from '../utils/formatting';

export function AdherenceAuditTrail({ logs, users }: { logs: ReminderLog[]; users: User[] }) {
  const ordered = [...logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 50);

  function elderName(elderId: string): string {
    return users.find((user) => user.id === elderId)?.fullName ?? 'Unknown elder';
  }

  return (
    <Card>
      <CardHeader
        title="Adherence history"
        description="Every confirmation, refusal and expiry, newest first."
        icon={<History aria-hidden="true" size={28} />}
      />

      {ordered.length === 0 ? (
        <EmptyState
          icon={<History size={44} />}
          title="No reminder history yet"
          description="As soon as a reminder is answered or expires, it is recorded here with a timestamp."
        />
      ) : (
        <>
          {/* Desktop and tablet: a real table. */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Reminder history with elder, medicine, dose, scheduled time, status and recorded time</caption>
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th scope="col" className="py-3 pr-4 text-lg font-bold text-slate-800">Elder</th>
                  <th scope="col" className="py-3 pr-4 text-lg font-bold text-slate-800">Medicine</th>
                  <th scope="col" className="py-3 pr-4 text-lg font-bold text-slate-800">Dose</th>
                  <th scope="col" className="py-3 pr-4 text-lg font-bold text-slate-800">Scheduled</th>
                  <th scope="col" className="py-3 pr-4 text-lg font-bold text-slate-800">Status</th>
                  <th scope="col" className="py-3 text-lg font-bold text-slate-800">Recorded</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((log) => (
                  <tr key={log.id} className="border-b border-slate-200 align-top">
                    <td className="py-4 pr-4 text-lg text-slate-900">{elderName(log.elderId)}</td>
                    <td className="py-4 pr-4 text-lg font-semibold text-slate-900">{log.medicineName}</td>
                    <td className="py-4 pr-4 text-lg text-slate-700">{log.dose}</td>
                    <td className="py-4 pr-4 text-lg text-slate-700">{formatTime12(log.scheduledTime)}</td>
                    <td className="py-4 pr-4"><StatusBadge status={log.status} /></td>
                    <td className="py-4 text-lg text-slate-700">{formatTimestamp(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: the same rows as cards. */}
          <ul className="space-y-4 md:hidden">
            {ordered.map((log) => (
              <li key={log.id} className="rounded-2xl border-2 border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-bold text-slate-900">{log.medicineName}</p>
                    <p className="text-lg text-slate-700">{log.dose}</p>
                  </div>
                  <StatusBadge status={log.status} />
                </div>
                <dl className="mt-3 space-y-1 text-lg text-slate-700">
                  <div className="flex gap-2">
                    <dt className="font-semibold">Elder:</dt>
                    <dd>{elderName(log.elderId)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold">Scheduled:</dt>
                    <dd>{formatTime12(log.scheduledTime)}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-semibold">Recorded:</dt>
                    <dd>{formatTimestamp(log.timestamp)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
