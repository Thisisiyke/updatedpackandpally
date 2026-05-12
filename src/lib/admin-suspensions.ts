/**
 * Admin take-down / suspension flags for trips and partners. Demo-only —
 * persisted in localStorage. In production this would be a server-side
 * moderation table.
 */

const TRIP_KEY = "packpally_admin_suspended_trips";
const PARTNER_KEY = "packpally_admin_suspended_partners";
const CHANGE_EVENT = "packpally_admin_suspensions_change";

function readSet(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

export function getSuspendedTripIds(): Set<string> {
  return readSet(TRIP_KEY);
}

export function getSuspendedPartnerIds(): Set<string> {
  return readSet(PARTNER_KEY);
}

export function toggleTripSuspension(id: string): boolean {
  const set = readSet(TRIP_KEY);
  const next = !set.has(id);
  if (next) set.add(id);
  else set.delete(id);
  writeSet(TRIP_KEY, set);
  return next;
}

export function togglePartnerSuspension(id: string): boolean {
  const set = readSet(PARTNER_KEY);
  const next = !set.has(id);
  if (next) set.add(id);
  else set.delete(id);
  writeSet(PARTNER_KEY, set);
  return next;
}

export function subscribeToSuspensions(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
