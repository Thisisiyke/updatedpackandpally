/**
 * Compute the installment schedule for a trip when the host has enabled
 * partial payment. Default is a 3-way equal split:
 *   1. Today (at booking)
 *   2. Midpoint between today and the trip start date
 *   3. Seven days before the trip start (or the trip start itself if <7 days)
 */

/** Minimum days between today and trip start for installments to be offered. */
export const INSTALLMENTS_MIN_DAYS = 14;

/** Default 3-way equal split (1/3, 1/3, 1/3 — last absorbs rounding). */
export const DEFAULT_INSTALLMENT_SPLITS: [number, number, number] = [
  0.3334,
  0.3333,
  0.3333,
];

export interface Installment {
  index: number; // 1, 2, 3
  label: string; // "First payment", "Second payment", "Final payment"
  percent: number;
  amount: number;
  dueAt: string; // ISO
}

function clampDate(date: Date, min: Date) {
  return date.getTime() < min.getTime() ? min : date;
}

/**
 * Build the schedule for a given trip.
 * Returns an array of three installments with computed due dates and amounts.
 */
export function computeInstallments(
  totalAmount: number,
  tripStartDateIso: string,
  splits: [number, number, number] = DEFAULT_INSTALLMENT_SPLITS
): Installment[] {
  const total = Math.max(0, Math.round(totalAmount));
  const today = new Date();
  const start = new Date(tripStartDateIso);

  // Sanity-clamp: due dates can never be in the past.
  const todayMs = today.getTime();
  const startMs = Math.max(start.getTime(), todayMs);

  // Installment 1: today
  const due1 = today;

  // Installment 2: midpoint between today and start
  const due2 = clampDate(new Date((todayMs + startMs) / 2), today);

  // Installment 3: 7 days before start, or start itself if trip is <7 days out
  const sevenDaysMs = 7 * 24 * 60 * 60_000;
  const due3 = clampDate(
    new Date(Math.max(startMs - sevenDaysMs, todayMs)),
    today
  );

  // Amount math — round to whole dollars, give the last installment any remainder
  const a1 = Math.round(total * splits[0]);
  const a2 = Math.round(total * splits[1]);
  const a3 = total - a1 - a2;

  const labels = ["First payment", "Second payment", "Final payment"];

  return [
    {
      index: 1,
      label: labels[0],
      percent: splits[0],
      amount: a1,
      dueAt: due1.toISOString(),
    },
    {
      index: 2,
      label: labels[1],
      percent: splits[1],
      amount: a2,
      dueAt: due2.toISOString(),
    },
    {
      index: 3,
      label: labels[2],
      percent: splits[2],
      amount: a3,
      dueAt: due3.toISOString(),
    },
  ];
}

/**
 * Whether installments are eligible given how close the trip start is. Hosts
 * can enable the toggle, but if the trip is starting in fewer than
 * INSTALLMENTS_MIN_DAYS days, the schedule collapses, so the option is
 * suppressed at checkout.
 */
export function installmentsEligible(tripStartDateIso: string): boolean {
  return daysUntilStart(tripStartDateIso) >= INSTALLMENTS_MIN_DAYS;
}

export function daysUntilStart(tripStartDateIso: string): number {
  const start = new Date(tripStartDateIso).getTime();
  const now = Date.now();
  return Math.ceil((start - now) / (24 * 60 * 60_000));
}

export function formatInstallmentDue(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
