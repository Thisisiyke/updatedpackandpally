/**
 * Traveler-side wrapper around host-sent reminders. Filters the shared
 * `packpally_payment_reminders` store down to reminders targeted at the
 * current user and tracks which ones have been read.
 */

import {
  getRemindersForTrip,
  subscribeToReminders,
  type ReminderRecord,
} from "@/data/reminders";

const READ_KEY = "packpally_reminder_reads";

/**
 * Booking ids tied to the current traveler ("me"). Keeps the mock data and
 * real-checkout bookings in sync — anything in this list is treated as the
 * traveler's own booking when matching reminders.
 */
export const MY_BOOKING_IDS = ["b1", "b4"];

export function getAllRemindersForMe(): ReminderRecord[] {
  // Reminders are keyed per-trip in the raw store; we gather across every trip
  // the traveler has booked by scanning localStorage directly once.
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("packpally_payment_reminders");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as ReminderRecord[])
      .filter((r) =>
        r.recipientBookingIds.some((id) => MY_BOOKING_IDS.includes(id))
      )
      .sort(
        (a, b) =>
          new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );
  } catch {
    return [];
  }
}

export function getReminderById(id: string): ReminderRecord | null {
  return getAllRemindersForMe().find((r) => r.id === id) || null;
}

function readReadSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function writeReadSet(set: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...set]));
    window.dispatchEvent(
      new CustomEvent("packpally_reminder_reads_change")
    );
  } catch {}
}

export function isReminderRead(id: string): boolean {
  return readReadSet().has(id);
}

export function markReminderRead(id: string): void {
  const set = readReadSet();
  if (!set.has(id)) {
    set.add(id);
    writeReadSet(set);
  }
}

export function markAllRead(): void {
  const ids = getAllRemindersForMe().map((r) => r.id);
  const set = readReadSet();
  let changed = false;
  for (const id of ids) {
    if (!set.has(id)) {
      set.add(id);
      changed = true;
    }
  }
  if (changed) writeReadSet(set);
}

export function countUnread(): number {
  const reads = readReadSet();
  return getAllRemindersForMe().filter((r) => !reads.has(r.id)).length;
}

export function subscribeToNotifications(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const unsubReminders = subscribeToReminders(cb);
  const onReadsChange = () => cb();
  window.addEventListener("packpally_reminder_reads_change", onReadsChange);
  return () => {
    unsubReminders();
    window.removeEventListener(
      "packpally_reminder_reads_change",
      onReadsChange
    );
  };
}

// Re-export so the inbox can also look up a reminder's tripId to render context
export { getRemindersForTrip };
