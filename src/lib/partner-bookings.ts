/**
 * Aggregates group-trip bookings for the partner side:
 * 1. seeded travelers per partner trip (so the Travelers tab is populated
 *    even before anyone has booked through checkout), merged with
 * 2. real bookings from localStorage key "packpally_bookings" — so anything
 *    booked via web or mobile checkout shows up on the host side immediately.
 */

export type PaymentMode = "full" | "partial";

export interface PartnerBooking {
  bookingId: string;
  tripId: string;
  tripTitle?: string;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  travelerId: string; // stable id for merge tags / reminders
  tripTravelers: number; // people count on this booking
  paymentMode: PaymentMode;
  totalPrice: number;
  amountPaidNow: number;
  amountDueLater: number;
  /** If partial, the remaining-payment deadline. */
  paymentDueAt?: string;
  createdAt: string;
  /** "seed" entries are fixed demo rows; "local" are from localStorage. */
  source: "seed" | "local";
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60_000).toISOString();
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60_000).toISOString();
}

/**
 * Hand-authored bookings attached to partner trips. Keyed by the trip id
 * travelers see in `src/data/trips.ts`. (The current logged-in partner —
 * Sofia Martinez aka host-1 — runs trip-1.)
 */
const SEED_BOOKINGS: PartnerBooking[] = [
  // trip-1 — Coastal Wonders of Amalfi (partner's own trip)
  // The current traveler ("me") is booked on this trip with a partial payment,
  // so the host can send them a reminder and see it land in their notifications.
  {
    bookingId: "b1",
    tripId: "trip-1",
    tripTitle: "Coastal Wonders of Amalfi",
    contact: {
      firstName: "Explorer",
      lastName: "",
      email: "explorer@packpally.com",
      phone: "+1 (415) 555-0199",
    },
    travelerId: "me",
    tripTravelers: 1,
    paymentMode: "partial",
    totalPrice: 2499,
    amountPaidNow: 750,
    amountDueLater: 1749,
    paymentDueAt: daysFromNow(21),
    createdAt: daysAgo(11),
    source: "seed",
  },
  {
    bookingId: "PP-SEED-AM1",
    tripId: "trip-1",
    tripTitle: "Coastal Wonders of Amalfi",
    contact: {
      firstName: "Emily",
      lastName: "Chen",
      email: "emily.chen@example.com",
      phone: "+1 (415) 555-0143",
    },
    travelerId: "t-emily",
    tripTravelers: 1,
    paymentMode: "full",
    totalPrice: 2499,
    amountPaidNow: 2499,
    amountDueLater: 0,
    createdAt: daysAgo(22),
    source: "seed",
  },
  {
    bookingId: "PP-SEED-AM2",
    tripId: "trip-1",
    tripTitle: "Coastal Wonders of Amalfi",
    contact: {
      firstName: "James",
      lastName: "Whitfield",
      email: "james.w@example.com",
      phone: "+1 (646) 555-0119",
    },
    travelerId: "t-james",
    tripTravelers: 2,
    paymentMode: "partial",
    totalPrice: 4998,
    amountPaidNow: 1499, // ~30% deposit
    amountDueLater: 3499,
    paymentDueAt: daysFromNow(18),
    createdAt: daysAgo(14),
    source: "seed",
  },
  {
    bookingId: "PP-SEED-AM3",
    tripId: "trip-1",
    tripTitle: "Coastal Wonders of Amalfi",
    contact: {
      firstName: "Aisha",
      lastName: "Patel",
      email: "aisha.patel@example.com",
      phone: "+1 (312) 555-0177",
    },
    travelerId: "t-aisha",
    tripTravelers: 1,
    paymentMode: "partial",
    totalPrice: 2499,
    amountPaidNow: 750,
    amountDueLater: 1749,
    paymentDueAt: daysFromNow(9),
    createdAt: daysAgo(9),
    source: "seed",
  },
  {
    bookingId: "PP-SEED-AM4",
    tripId: "trip-1",
    tripTitle: "Coastal Wonders of Amalfi",
    contact: {
      firstName: "Marcus",
      lastName: "Reeves",
      email: "m.reeves@example.com",
      phone: "+1 (718) 555-0162",
    },
    travelerId: "t-marcus",
    tripTravelers: 1,
    paymentMode: "full",
    totalPrice: 2499,
    amountPaidNow: 2499,
    amountDueLater: 0,
    createdAt: daysAgo(4),
    source: "seed",
  },
  {
    bookingId: "PP-SEED-AM5",
    tripId: "trip-1",
    tripTitle: "Coastal Wonders of Amalfi",
    contact: {
      firstName: "Rachel",
      lastName: "O'Donnell",
      email: "rachel.od@example.com",
      phone: "+1 (503) 555-0198",
    },
    travelerId: "t-rachel",
    tripTravelers: 2,
    paymentMode: "partial",
    totalPrice: 4398, // group rate tier hypothetical
    amountPaidNow: 1320,
    amountDueLater: 3078,
    paymentDueAt: daysFromNow(26),
    createdAt: daysAgo(2),
    source: "seed",
  },

  // trip-2 — Sacred Temples of Kyoto (Kenji)
  {
    bookingId: "PP-SEED-KY1",
    tripId: "trip-2",
    tripTitle: "Sacred Temples of Kyoto",
    contact: {
      firstName: "Oliver",
      lastName: "Berg",
      email: "oliver.berg@example.com",
      phone: "+46 70 555 0112",
    },
    travelerId: "t-oliver",
    tripTravelers: 1,
    paymentMode: "full",
    totalPrice: 3199,
    amountPaidNow: 3199,
    amountDueLater: 0,
    createdAt: daysAgo(16),
    source: "seed",
  },
  {
    bookingId: "PP-SEED-KY2",
    tripId: "trip-2",
    tripTitle: "Sacred Temples of Kyoto",
    contact: {
      firstName: "Hannah",
      lastName: "Johansson",
      email: "h.johansson@example.com",
      phone: "+46 70 555 0167",
    },
    travelerId: "t-hannah",
    tripTravelers: 1,
    paymentMode: "partial",
    totalPrice: 3199,
    amountPaidNow: 960,
    amountDueLater: 2239,
    paymentDueAt: daysFromNow(12),
    createdAt: daysAgo(6),
    source: "seed",
  },

  // trip-3 — Serengeti Safari (Amara)
  {
    bookingId: "PP-SEED-SG1",
    tripId: "trip-3",
    tripTitle: "Serengeti Safari Experience",
    contact: {
      firstName: "Ryan",
      lastName: "Cooper",
      email: "ryan.cooper@example.com",
      phone: "+1 (206) 555-0154",
    },
    travelerId: "t-ryan",
    tripTravelers: 1,
    paymentMode: "full",
    totalPrice: 4299,
    amountPaidNow: 4299,
    amountDueLater: 0,
    createdAt: daysAgo(40),
    source: "seed",
  },
  {
    bookingId: "PP-SEED-SG2",
    tripId: "trip-3",
    tripTitle: "Serengeti Safari Experience",
    contact: {
      firstName: "Diego",
      lastName: "Navarro",
      email: "diego.n@example.com",
      phone: "+1 (312) 555-0129",
    },
    travelerId: "t-diego",
    tripTravelers: 2,
    paymentMode: "partial",
    totalPrice: 8598,
    amountPaidNow: 2580,
    amountDueLater: 6018,
    paymentDueAt: daysFromNow(35),
    createdAt: daysAgo(12),
    source: "seed",
  },
];

interface LocalBookingShape {
  bookingId: string;
  type?: "flight" | "hotel" | "trip";
  createdAt?: string;
  contact?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  totalPrice?: number;
  trip?: { id: string; title?: string } | null;
  tripTravelers?: number | null;
  paymentMode?: PaymentMode;
  amountPaidNow?: number;
  amountDueLater?: number;
}

function fromLocalStorage(): PartnerBooking[] {
  if (typeof window === "undefined") return [];
  let raw: string | null = null;
  try {
    raw = localStorage.getItem("packpally_bookings");
  } catch {
    return [];
  }
  if (!raw) return [];
  let list: LocalBookingShape[];
  try {
    list = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(list)) return [];

  return list
    .filter((b) => b.type === "trip" && b.trip?.id && b.contact)
    .map<PartnerBooking>((b) => {
      const total = b.totalPrice || 0;
      const paidNow = b.amountPaidNow ?? total;
      const dueLater = b.amountDueLater ?? Math.max(0, total - paidNow);
      const mode: PaymentMode = b.paymentMode === "partial" ? "partial" : "full";
      return {
        bookingId: b.bookingId,
        tripId: b.trip!.id,
        tripTitle: b.trip!.title,
        contact: b.contact!,
        travelerId: `local-${b.bookingId}`,
        tripTravelers: b.tripTravelers ?? 1,
        paymentMode: mode,
        totalPrice: total,
        amountPaidNow: paidNow,
        amountDueLater: dueLater,
        createdAt: b.createdAt || new Date().toISOString(),
        source: "local",
      };
    });
}

/**
 * Partner trip ids use the `ptrip-*` prefix; the traveler-facing `trips.ts`
 * uses `trip-*`. Bookings (seeded or from localStorage) are keyed by the
 * traveler-facing id, so we accept either form when loading.
 */
function tripIdAliases(tripId: string): string[] {
  const aliases = new Set([tripId]);
  if (tripId.startsWith("ptrip-")) {
    aliases.add(tripId.replace(/^ptrip-/, "trip-"));
  } else if (tripId.startsWith("trip-")) {
    aliases.add(tripId.replace(/^trip-/, "ptrip-"));
  }
  return Array.from(aliases);
}

export function getBookingsForTrip(tripId: string): PartnerBooking[] {
  const aliases = tripIdAliases(tripId);
  const match = (b: PartnerBooking) => aliases.includes(b.tripId);
  const combined = [
    ...fromLocalStorage().filter(match),
    ...SEED_BOOKINGS.filter(match),
  ];
  // Newest first
  combined.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return combined;
}

export interface TripPaymentStats {
  totalBookings: number;
  totalTravelers: number;
  totalCollected: number;
  totalOutstanding: number;
  fullyPaidCount: number;
  partialCount: number;
}

export function getTripPaymentStats(
  bookings: PartnerBooking[]
): TripPaymentStats {
  return bookings.reduce(
    (acc, b) => {
      acc.totalBookings += 1;
      acc.totalTravelers += b.tripTravelers;
      acc.totalCollected += b.amountPaidNow;
      acc.totalOutstanding += b.amountDueLater;
      if (b.paymentMode === "full") acc.fullyPaidCount += 1;
      else acc.partialCount += 1;
      return acc;
    },
    {
      totalBookings: 0,
      totalTravelers: 0,
      totalCollected: 0,
      totalOutstanding: 0,
      fullyPaidCount: 0,
      partialCount: 0,
    }
  );
}
