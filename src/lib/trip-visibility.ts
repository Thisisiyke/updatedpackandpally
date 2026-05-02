/**
 * Trip visibility helpers.
 *
 * `status` controls bookability (published / draft / sold-out).
 * `visibility` controls discovery (public / private).
 *
 * A trip with status="published" + visibility="private" is fully bookable
 * but only reachable through a direct share link — it doesn't appear in
 * browse, featured, or any other public listing.
 */

import type { Trip } from "@/types";
import type { PartnerTrip } from "@/data/partner-trips";

type AnyTrip = Pick<Trip, "id" | "slug"> | Pick<PartnerTrip, "id" | "slug">;

type Visible = { visibility?: "public" | "private" };

/**
 * Returns true if a trip is publicly discoverable (i.e. should appear in
 * browse / featured / mobile discovery feeds). Treats missing `visibility`
 * as "public" so legacy data keeps working.
 *
 * Status filtering (drafts, sold-out, etc.) is the caller's concern —
 * surfaces already filter on status independently.
 */
export function isDiscoverable(trip: Visible): boolean {
  return (trip.visibility ?? "public") === "public";
}

/**
 * Lightweight share-key derived from trip id. Not security; this is a demo
 * unguessability hint so private links don't trivially leak via id-iteration.
 * In production this would be a signed server-issued token.
 */
export function getShareKey(tripId: string): string {
  // FNV-1a 32-bit, then base36 — short, stable, no deps.
  let hash = 0x811c9dc5;
  for (let i = 0; i < tripId.length; i++) {
    hash ^= tripId.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

/**
 * Build the canonical traveler-facing URL for a trip. For private trips,
 * appends `?k=<shareKey>` so unlisted access via the link works.
 *
 * basePath: "/trips" for web, "/mobile/trips" for mobile. Caller decides.
 */
export function getShareableTripUrl(
  trip: AnyTrip & Visible,
  basePath: "/trips" | "/mobile/trips" = "/trips"
): string {
  const isPrivate = (trip.visibility ?? "public") === "private";
  const slug = trip.slug || trip.id;
  return isPrivate
    ? `${basePath}/${slug}?k=${getShareKey(trip.id)}`
    : `${basePath}/${slug}`;
}

/**
 * Returns true if the given share-key matches the trip's expected key.
 * Public trips always pass.
 */
export function canAccessTrip(
  trip: AnyTrip & Visible,
  providedKey: string | null | undefined
): boolean {
  if ((trip.visibility ?? "public") === "public") return true;
  return !!providedKey && providedKey === getShareKey(trip.id);
}
