/**
 * Host-side booking notifications.
 *
 * Surfaces every booking across the host's trips as a notification feed.
 * Tracks "last viewed" timestamp in localStorage so we can compute an unread
 * count for the bell badge.
 */

import { partnerTrips, type PartnerTrip } from "@/data/partner-trips";
import { getUserPartnerTrips } from "@/lib/user-partner-trips";
import {
  getBookingsForTrip,
  type PartnerBooking,
} from "@/lib/partner-bookings";

const LAST_VIEWED_KEY = "packpally_partner_notifications_last_viewed";
const CHANGE_EVENT = "packpally_partner_notifications_change";

export interface PartnerBookingNotification {
  bookingId: string;
  trip: Pick<PartnerTrip, "id" | "title" | "coverImage" | "destination">;
  booking: PartnerBooking;
  /** True when the booking is newer than the last viewed timestamp. */
  unread: boolean;
}

function allHostTrips(): PartnerTrip[] {
  if (typeof window === "undefined") return [...partnerTrips];
  const userTrips = getUserPartnerTrips();
  const userIds = new Set(userTrips.map((t) => t.id));
  const seed = partnerTrips.filter((t) => !userIds.has(t.id));
  return [...userTrips, ...seed];
}

export function getAllHostBookings(): PartnerBookingNotification[] {
  if (typeof window === "undefined") return [];
  const lastViewed = readLastViewed();
  const trips = allHostTrips();
  const items: PartnerBookingNotification[] = [];
  for (const t of trips) {
    const bookings = getBookingsForTrip(t.id);
    for (const b of bookings) {
      items.push({
        bookingId: b.bookingId,
        trip: {
          id: t.id,
          title: t.title,
          coverImage: t.coverImage,
          destination: t.destination,
        },
        booking: b,
        unread:
          !lastViewed ||
          new Date(b.createdAt).getTime() > new Date(lastViewed).getTime(),
      });
    }
  }
  // Newest bookings first
  items.sort(
    (a, b) =>
      new Date(b.booking.createdAt).getTime() -
      new Date(a.booking.createdAt).getTime()
  );
  return items;
}

export function countUnreadBookings(): number {
  return getAllHostBookings().filter((n) => n.unread).length;
}

function readLastViewed(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(LAST_VIEWED_KEY);
  } catch {
    return null;
  }
}

export function markBookingsViewed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_VIEWED_KEY, new Date().toISOString());
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

export function subscribeToPartnerNotifications(
  cb: () => void
): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGE_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
