import { wanderlyItemToPartnerTripBookingRow } from "@/lib/wanderly-partner-map";

/** Traveler “My bookings” row derived from wanderly-1 `Wan-tripBookings`. */
export type TravelerDashboardBooking = {
  id: string;
  tripRouteId: string;
  tripTitle: string;
  destination: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  travelers: number;
  totalPrice: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  bookedDate: string;
};

export function wanderlyItemToTravelerDashboardBooking(
  row: Record<string, unknown>
): TravelerDashboardBooking {
  const base = wanderlyItemToPartnerTripBookingRow(row);
  const partial = row.paymentStatus === "partial";
  const rawStatus = String(row.status ?? "Booked");
  let status = base.status;
  if (rawStatus === "Booked" && partial) {
    status = "pending";
  }
  const imgs = Array.isArray(row.tripImages)
    ? (row.tripImages as string[])
    : [];
  const cover = imgs[0] || "/placeholder.svg";

  return {
    id: base.id,
    tripRouteId: base.tripRouteId,
    tripTitle: base.tripName,
    destination: String(row.destination ?? "").trim() || base.roomTypeLabel,
    coverImage: cover,
    startDate: base.checkIn,
    endDate: base.checkOut,
    travelers: base.guests,
    totalPrice: base.totalPrice,
    status,
    bookedDate: base.bookedAt.slice(0, 10),
  };
}
