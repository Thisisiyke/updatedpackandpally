/**
 * User-created partner trips (from the mobile create-trip wizard).
 * Persisted in localStorage so they survive navigation within a demo session.
 * Merged into the seed `partnerTrips` list when rendering partner dashboards.
 */

import type { PartnerTrip } from "@/data/partner-trips";

const STORAGE_KEY = "packpally_user_partner_trips";
const CHANGE_EVENT = "packpally_user_partner_trips_change";

export function getUserPartnerTrips(): PartnerTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserPartnerTrip(trip: PartnerTrip): void {
  if (typeof window === "undefined") return;
  try {
    const list = getUserPartnerTrips();
    // Upsert by id
    const next = [trip, ...list.filter((t) => t.id !== trip.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

export function subscribeToUserPartnerTrips(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
