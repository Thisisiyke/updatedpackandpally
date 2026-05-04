/**
 * Helpers for the host-controlled "close-join date" — the optional cutoff
 * after which new bookings for a trip are blocked. The host sets this on the
 * trip itself; travelers see the trip but cannot proceed to checkout once
 * the date has passed.
 *
 * Once the trip is sold out the close-join window is irrelevant.
 */

const MS_PER_DAY = 24 * 60 * 60_000;

export interface BookingWindowInput {
  /** ISO YYYY-MM-DD trip start date. */
  startDate: string;
  /** ISO YYYY-MM-DD host-set close-join date (optional). */
  closeJoinDate?: string | null;
  /** Current bookings already accepted. */
  currentBookings?: number;
  /** Trip max group size. */
  maxGroupSize?: number;
}

export type BookingWindowState =
  | { status: "open" }
  | { status: "sold-out" }
  | { status: "closed-by-host"; closedOn: string }
  | { status: "trip-started" };

/**
 * Resolve the booking window for a trip. Pass the entire trip-ish object;
 * fields that are missing default to "open".
 */
export function resolveBookingWindow(
  input: BookingWindowInput
): BookingWindowState {
  const {
    startDate,
    closeJoinDate,
    currentBookings = 0,
    maxGroupSize = Infinity,
  } = input;

  if (currentBookings >= maxGroupSize) return { status: "sold-out" };

  const now = Date.now();
  const start = new Date(startDate).getTime();
  if (Number.isFinite(start) && now > start) return { status: "trip-started" };

  if (closeJoinDate) {
    // Close-join is end-of-day inclusive: bookings allowed up through 23:59:59.
    const close = new Date(closeJoinDate).getTime();
    if (Number.isFinite(close)) {
      const closeEndOfDay = close + MS_PER_DAY - 1;
      if (now > closeEndOfDay) {
        return { status: "closed-by-host", closedOn: closeJoinDate };
      }
    }
  }

  return { status: "open" };
}

/**
 * Convenience: true when bookings are blocked for any reason. Useful at the
 * call-site for "is the Book button disabled?" without caring about why.
 */
export function bookingsClosed(input: BookingWindowInput): boolean {
  return resolveBookingWindow(input).status !== "open";
}

/**
 * Friendly inline reason for the "bookings closed" UI message. Sold-out is
 * handled separately on the booking card so we don't return a string for it.
 */
export function bookingClosedMessage(state: BookingWindowState): string | null {
  if (state.status === "closed-by-host") {
    const date = new Date(state.closedOn).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return `The host stopped accepting new bookings after ${date}.`;
  }
  if (state.status === "trip-started") {
    return "This trip has already started — new bookings are closed.";
  }
  return null;
}
