export type ReminderChannel = "email" | "sms" | "push";

export interface ReminderRecord {
  id: string;
  tripId: string;
  channel: ReminderChannel;
  subject?: string; // email only
  body: string;
  /** Booking ids or traveler ids that received this reminder. */
  recipientBookingIds: string[];
  /** Names of the travelers at the time the reminder was sent (for history display). */
  recipientNames: string[];
  senderName: string;
  sentAt: string;
}

const STORAGE_KEY = "packpally_payment_reminders";
const CHANGE_EVENT = "packpally_reminders_change";

function readAll(): ReminderRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First-time: seed a demo push reminder so the traveler sees one in
      // today's group of /mobile/notifications on first visit.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_REMINDERS));
      return SEED_REMINDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list: ReminderRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

export function getRemindersForTrip(tripId: string): ReminderRecord[] {
  return readAll()
    .filter((r) => r.tripId === tripId)
    .sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
}

export function saveReminder(
  input: Omit<ReminderRecord, "id" | "sentAt">
): ReminderRecord {
  const record: ReminderRecord = {
    ...input,
    id: `rem-${Date.now()}`,
    sentAt: new Date().toISOString(),
  };
  writeAll([record, ...readAll()]);
  return record;
}

export function subscribeToReminders(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export interface ReminderTemplate {
  id: string;
  label: string;
  subject: string;
  body: string;
}

/**
 * Templates use merge tokens that the sheet will render before sending:
 *   {name}       → traveler's first name
 *   {tripTitle}  → trip title
 *   {amountDue}  → amount still owed (formatted)
 *   {dueDate}    → payment due date (formatted short)
 *   {hostName}   → partner's name
 */
export const REMINDER_TEMPLATES: ReminderTemplate[] = [
  {
    id: "friendly-due-soon",
    label: "Payment due soon",
    subject: "Quick reminder: your balance for {tripTitle}",
    body: `Hi {name},

Just a friendly nudge — your remaining balance of {amountDue} for {tripTitle} is due by {dueDate}.

You can settle up anytime from your Pack & Pally bookings page. Let me know if you have any questions!

{hostName}`,
  },
  {
    id: "overdue",
    label: "Payment overdue",
    subject: "Balance due for {tripTitle}",
    body: `Hi {name},

This is a reminder that the outstanding balance of {amountDue} for {tripTitle} is now past due. To keep your spot, please complete payment as soon as possible.

If something's come up, message me and we'll figure it out.

{hostName}`,
  },
  {
    id: "final-call",
    label: "Final call",
    subject: "Final reminder — {tripTitle}",
    body: `Hi {name},

Final reminder that {amountDue} is owed on your booking for {tripTitle}. Spots go back on sale if payment isn't received within the next 72 hours.

Please reach out if you need anything.

{hostName}`,
  },
  {
    id: "custom",
    label: "Custom message",
    subject: "A note from your trip host",
    body: "",
  },
];

function minutesAgo(n: number) {
  return new Date(Date.now() - n * 60_000).toISOString();
}

// ── Seeded demo reminders (appear in today's group on first visit) ──
const SEED_REMINDERS: ReminderRecord[] = [
  {
    id: "rem-seed-push-1",
    tripId: "trip-1",
    channel: "push",
    body:
      "Hi Explorer — quick reminder that $1,749 is still outstanding on your Amalfi trip. Tap to settle up. Can't wait to see you in Positano!",
    recipientBookingIds: ["b1"],
    recipientNames: ["Explorer"],
    senderName: "Sofia Martinez",
    sentAt: minutesAgo(12),
  },
];
