import type { Alert, Medicine, User } from '../types';
import { formatTime12, statusLabel } from '../utils/formatting';
import { medicinesForElder, nextMedicine } from './medication';
import { getMinutesUntilDue, isReminderActive, sortByTime } from '../utils/date';

export const CAREAI_SAFETY_BANNER =
  'CareAI is a schedule assistant. It cannot diagnose or change dosages.';

export const DOSAGE_SAFETY_REPLY =
  "I can't tell you to increase, decrease, or change a medicine dose. Please follow the prescription and contact your doctor or caretaker before taking an additional dose.";

export interface CareAIContextInput {
  user: User;
  /** Medicines belonging to the elder the question is about. */
  medicines: Medicine[];
  alerts: Alert[];
  caretakerName: string | null;
  caretakerPhone: string | null;
  now?: Date;
}

const DOSAGE_PATTERNS = [
  /\b(two|2|three|3|extra|another|double|additional)\s+(tablet|tablets|pill|pills|dose|doses)\b/i,
  /\bincrease\b|\bdecrease\b|\breduce\b|\bskip\b|\bstop taking\b|\bstop my\b/i,
  /\bchange (my )?(dose|dosage|medicine)\b/i,
  /\bhow (much|many) (more|should i take)\b/i,
  /\bcan i take (another|more|two|2)\b/i,
  /\boverdose\b/i,
];

const DIAGNOSIS_PATTERNS = [
  /\b(do i have|am i having|is this|what.s wrong with me|diagnose|symptom|symptoms|side effect|side effects)\b/i,
  /\b(chest pain|dizzy|dizziness|fever|rash|bleeding)\b/i,
];

function listMedicines(medicines: Medicine[]): string {
  return sortByTime(medicines)
    .map((medicine) => `• ${medicine.name} — ${medicine.dose} at ${formatTime12(medicine.time)}`)
    .join('\n');
}

export function answerCareAI(question: string, input: CareAIContextInput): string {
  const now = input.now ?? new Date();
  const text = question.trim();
  const lower = text.toLowerCase();
  const active = input.medicines.filter((medicine) => medicine.status !== 'disabled');

  if (!text) {
    return 'Ask me about your medicine schedule — for example, "What is my next medicine?"';
  }

  if (DOSAGE_PATTERNS.some((pattern) => pattern.test(lower))) {
    return DOSAGE_SAFETY_REPLY;
  }

  if (DIAGNOSIS_PATTERNS.some((pattern) => pattern.test(lower))) {
    return "I can't check symptoms or tell you what a medicine is doing to your body. Please call your caretaker or doctor. If it feels like an emergency, use the Emergency contact button at the top of the screen.";
  }

  if (/caretaker|caregiver|carer|contact my/i.test(lower)) {
    if (input.caretakerName) {
      return `Your caretaker is ${input.caretakerName}${
        input.caretakerPhone ? `. Their number is ${input.caretakerPhone}` : ''
      }. Use the Emergency contact button in the header to call, or open Profile to see the full details.`;
    }
    return 'You are not connected to a caretaker yet. Open Profile and enter the caretaker code they gave you, for example CARE-7F29K4.';
  }

  if (/missed|not taken|forgot/i.test(lower)) {
    const missed = active.filter((m) => m.status === 'missed' || m.status === 'not_taken');
    if (missed.length === 0) return 'Nothing has been missed today. Well done.';
    return `${missed.length} reminder${missed.length === 1 ? ' was' : 's were'} not confirmed today:\n${listMedicines(missed)}\n\nYour caretaker can see this too.`;
  }

  if (/have i taken|already taken|which.*taken|what.*taken/i.test(lower)) {
    const taken = active.filter((m) => m.status === 'taken');
    if (taken.length === 0) return 'You have not confirmed any medicine yet today.';
    return `You have confirmed ${taken.length} medicine${taken.length === 1 ? '' : 's'} today:\n${listMedicines(taken)}`;
  }

  if (/next medicine|next dose|what.s next|when.*next/i.test(lower)) {
    const next = nextMedicine(active, now);
    if (!next) return 'There is nothing else scheduled for today. Your next reminder will appear tomorrow morning.';
    if (isReminderActive(next.time, now)) {
      return `${next.name} — ${next.dose} is due now (${formatTime12(next.time)}). Tap "Taken" once you have taken it.`;
    }
    const minutes = getMinutesUntilDue(next.time, now);
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    const wait = hours > 0 ? `${hours} hour${hours === 1 ? '' : 's'} ${rest} minute${rest === 1 ? '' : 's'}` : `${minutes} minute${minutes === 1 ? '' : 's'}`;
    return `Your next medicine is ${next.name} — ${next.dose} at ${formatTime12(next.time)}, in about ${wait}.`;
  }

  if (/today|schedule|what medicines|my medicines|list/i.test(lower)) {
    if (active.length === 0) {
      return 'There are no medicines on your schedule yet. Your caretaker can add them.';
    }
    return `You have ${active.length} medicine${active.length === 1 ? '' : 's'} scheduled today:\n${listMedicines(active)}`;
  }

  if (/alert|alerts|problem/i.test(lower)) {
    const open = input.alerts.filter((alert) => !alert.acknowledged);
    if (open.length === 0) return 'There are no open alerts right now.';
    return `There ${open.length === 1 ? 'is 1 open alert' : `are ${open.length} open alerts`}:\n${open
      .map((alert) => `• ${alert.message}`)
      .join('\n')}`;
  }

  if (/hello|hi\b|hey|good morning|good evening|thank/i.test(lower)) {
    return `Hello ${input.user.fullName.split(' ')[0]}. I can read out your schedule, tell you what is next, and show what you have missed. What would you like to know?`;
  }

  if (/status of|how am i doing|adherence/i.test(lower)) {
    const taken = active.filter((m) => m.status === 'taken').length;
    const missed = active.filter((m) => m.status === 'missed' || m.status === 'not_taken').length;
    const pending = active.filter((m) => m.status === 'scheduled').length;
    return `Today so far: ${taken} taken, ${missed} missed, ${pending} still to come.`;
  }

  return 'I can help with your medicine schedule only. Try asking "What medicines do I take today?", "What is my next medicine?" or "Show my missed reminders".';
}

export function describeStatusForChat(medicine: Medicine): string {
  return `${medicine.name} (${medicine.dose}) at ${formatTime12(medicine.time)} — ${statusLabel(medicine.status)}`;
}

export const QUICK_PROMPTS = [
  'What medicines do I take today?',
  'What is my next medicine?',
  'Which medicines have I taken?',
  'Show my missed reminders',
  'Contact my caretaker',
];
