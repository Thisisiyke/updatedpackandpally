import type { PartnerTrip } from "@/data/partner-trips";
import type { Trip } from "@/types";
import type { WanderlyTripRecord } from "@/lib/wanderly-trip-adapter";
import { wanderlyTripToUiTrip } from "@/lib/wanderly-trip-adapter";
import { encodeTripRouteKey } from "@/lib/trip-url";
import type { PartnerBooking } from "@/lib/partner-bookings";

export function uiTripToPartnerTrip(t: Trip): PartnerTrip {
  const st: PartnerTrip["status"] =
    t.status === "sold-out" ? "sold-out" : "published";
  return {
    id: t.id,
    title: t.title,
    slug: t.slug,
    destination: t.destination,
    country: t.country,
    category: t.category,
    difficulty: t.difficulty,
    coverImage: t.coverImage,
    images: t.images,
    startDate: t.startDate,
    endDate: t.endDate,
    durationDays: t.durationDays,
    price: t.price,
    priceTiers: t.priceTiers,
    taxRate: t.taxRate,
    partialPayment: t.partialPayment,
    closeJoinDate: t.closeJoinDate,
    currency: t.currency,
    maxGroupSize: t.maxGroupSize,
    currentBookings: t.currentBookings,
    description: t.description,
    highlights: t.highlights,
    itinerary: t.itinerary,
    included: t.included,
    notIncluded: t.notIncluded,
    status: st,
    revenue: 0,
    createdAt: t.startDate,
    rating: t.rating,
    reviewCount: t.reviewCount,
  };
}

export function wanderlyHostTripToPartnerTrip(raw: WanderlyTripRecord): PartnerTrip {
  const t = wanderlyTripToUiTrip(raw);
  const stRaw = (raw.status || "Active").toLowerCase();
  let status: PartnerTrip["status"] = "published";
  if (stRaw === "draft") status = "draft";
  if (t.status === "sold-out") status = "sold-out";

  return {
    id: t.id,
    title: t.title,
    slug: t.slug,
    destination: t.destination,
    country: t.country,
    category: t.category,
    difficulty: t.difficulty,
    coverImage: t.coverImage,
    images: t.images,
    startDate: t.startDate,
    endDate: t.endDate,
    durationDays: t.durationDays,
    price: t.price,
    currency: "USD",
    maxGroupSize: t.maxGroupSize,
    currentBookings: t.currentBookings,
    description: t.description,
    highlights: t.highlights,
    itinerary: t.itinerary,
    included: t.included,
    notIncluded: t.notIncluded,
    status,
    revenue: 0,
    createdAt: raw.timestamp || t.startDate,
    rating: t.rating,
    reviewCount: t.reviewCount,
    taxRate: t.taxRate,
    partialPayment: t.partialPayment,
    closeJoinDate: t.closeJoinDate,
  };
}

export function wanderlyApiBookingToPartnerBooking(
  row: Record<string, unknown>
): PartnerBooking {
  const tripIdRaw = String(row.tripId ?? "");
  const ts = String(row.tripTimestamp ?? "");
  const routeId = encodeTripRouteKey(tripIdRaw, ts);
  const parts = Array.isArray(row.amountPaid) ? row.amountPaid : [];
  const first = parts[0] as { installment1?: string } | undefined;
  const paid = first ? Number(first.installment1 || 0) : 0;
  const toPay = Number(row.amountToPay ?? 0);
  const partial = row.paymentStatus === "partial";
  const total = partial ? paid + toPay : paid;
  const tsNum = Number(row.timestamp ?? Date.now());

  return {
    bookingId: String(row._id ?? ""),
    tripId: routeId,
    tripTitle: String(row.tripName ?? ""),
    contact: {
      firstName: String(row.firstName ?? ""),
      lastName: String(row.lastName ?? ""),
      email: String(row.email ?? ""),
      phone: String(row.mobile ?? ""),
    },
    travelerId: String(row.userId ?? row._id ?? ""),
    tripTravelers: Number(row.bookedCount ?? 1),
    paymentMode: partial ? "partial" : "full",
    totalPrice: total || paid,
    amountPaidNow: paid,
    amountDueLater: partial ? toPay : 0,
    paymentDueAt: String(row.scheduleDateToPay ?? ""),
    createdAt: new Date(tsNum).toISOString(),
    source: "api",
  };
}

export type PartnerTripBookingRow = {
  id: string;
  guestName: string;
  guestEmail: string;
  guestAvatar: string;
  tripName: string;
  tripRouteId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  totalPrice: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  bookedAt: string;
  roomTypeLabel: string;
};

export function wanderlyItemToPartnerTripBookingRow(
  row: Record<string, unknown>
): PartnerTripBookingRow {
  const tripIdRaw = String(row.tripId ?? "");
  const ts = String(row.tripTimestamp ?? "");
  const routeId = encodeTripRouteKey(tripIdRaw, ts);
  const parts = Array.isArray(row.amountPaid) ? row.amountPaid : [];
  const first = parts[0] as { installment1?: string } | undefined;
  const paid = first ? Number(first.installment1 || 0) : 0;
  const toPay = Number(row.amountToPay ?? 0);
  const partial = row.paymentStatus === "partial";
  const total = partial ? paid + toPay : paid;
  const rawStatus = String(row.status ?? "Booked").toLowerCase();
  let status: PartnerTripBookingRow["status"] = "confirmed";
  if (rawStatus === "pending") status = "pending";
  if (rawStatus === "cancelled") status = "cancelled";
  if (rawStatus === "completed") status = "completed";

  return {
    id: String(row._id ?? ""),
    guestName: `${String(row.firstName ?? "").trim()} ${String(row.lastName ?? "").trim()}`.trim(),
    guestEmail: String(row.email ?? ""),
    guestAvatar: String(row.userProfileImg ?? "") || "/placeholder.svg",
    tripName: String(row.tripName ?? "Trip"),
    tripRouteId: routeId,
    checkIn: String(row.startDate ?? ""),
    checkOut: String(row.endDate ?? ""),
    guests: Number(row.bookedCount ?? 1),
    nights: Number(row.nights ?? 0),
    totalPrice: total || paid,
    status,
    bookedAt: new Date(Number(row.timestamp ?? Date.now())).toISOString(),
    roomTypeLabel: String(row.destination ?? "Group trip"),
  };
}
