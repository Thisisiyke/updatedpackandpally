/**
 * User-created partner trips (from the mobile create-trip wizard).
 * Persisted in localStorage so they survive navigation within a demo session.
 * Merged into the seed `partnerTrips` list when rendering partner dashboards.
 */

import type { PartnerTrip } from "@/data/partner-trips";

const STORAGE_KEY = "packpally_user_partner_trips";
const HIDDEN_KEY = "packpally_partner_trips_hidden";
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

/**
 * Delete a trip:
 *  - If it's a user-created trip, drop it from the localStorage list.
 *  - If it's a seed trip we can't actually mutate, soft-hide its id.
 * `getHiddenTripIds()` is used by the partner dashboard to filter the merged
 * seed + user list.
 */
export function deleteUserPartnerTrip(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getUserPartnerTrips();
    const filtered = list.filter((t) => t.id !== id);
    if (filtered.length !== list.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } else {
      // Seed trip — soft-hide
      const hidden = getHiddenTripIds();
      hidden.add(id);
      localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]));
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

export function getHiddenTripIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
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
