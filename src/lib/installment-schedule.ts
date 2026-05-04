/**
 * Installment scheduler. The host picks one of three strategies on the trip:
 *
 *   • "biweekly" — one installment every ~14 days from booking to a week
 *     before the trip starts. Number of installments is derived from how
 *     much time is left.
 *   • "weekly"   — same idea, every ~7 days.
 *   • "custom"   — host-supplied {dueAt, percent} list. Used as-is.
 *
 * If the trip start is within INSTALLMENTS_MIN_HOURS, partial payment is
 * suppressed and travelers must pay in full.
 */

/** Minimum hours between today and trip start for installments to be offered. */
export const INSTALLMENTS_MIN_HOURS = 48;

/** Default schedule when partial payment is enabled but no schedule was set. */
export const DEFAULT_SCHEDULE: PaymentSchedule = "biweekly";

/** How many days before the trip starts the final installment is due. */
const FINAL_INSTALLMENT_DAYS_BEFORE_START = 7;

const MS_PER_DAY = 24 * 60 * 60_000;

export type PaymentSchedule = "biweekly" | "weekly" | "custom";

export interface CustomSplit {
  /** ISO date string for when this installment is due. */
  dueAt: string;
  /** Decimal share of the total, e.g. 0.25 for 25%. All splits must sum to 1. */
  percent: number;
}

export interface Installment {
  index: number;
  /** Friendly label, e.g. "First payment", "Final payment", "Payment 3". */
  label: string;
  percent: number;
  amount: number;
  /** ISO timestamp. */
  dueAt: string;
}

function clampDate(date: Date, min: Date) {
  return date.getTime() < min.getTime() ? min : date;
}

function labelFor(index: number, total: number): string {
  if (total <= 1) return "Payment";
  if (index === 1) return "First payment";
  if (index === total) return "Final payment";
  if (index === 2) return "Second payment";
  if (index === 3) return "Third payment";
  return `Payment ${index}`;
}

/**
 * Build the installment due dates for a biweekly/weekly cadence. Always at
 * least 2 installments: one today and the final one ~7 days before the trip.
 * Middle installments are spaced as evenly as possible at the requested
 * interval (no installment in the past).
 */
function buildIntervalDueDates(
  tripStart: Date,
  intervalDays: 7 | 14
): Date[] {
  const today = new Date();
  const finalDate = new Date(
    tripStart.getTime() - FINAL_INSTALLMENT_DAYS_BEFORE_START * MS_PER_DAY
  );
  const safeFinal = clampDate(finalDate, today);
  const totalDays = Math.max(
    0,
    Math.round((safeFinal.getTime() - today.getTime()) / MS_PER_DAY)
  );

  if (totalDays <= 0) {
    // Trip is too soon for a real schedule; caller should have already
    // suppressed partial pay via installmentsEligible(). Fallback to a
    // 2-installment schedule (today + final) so we never crash.
    return [today, safeFinal];
  }

  // Number of installments = ceil(totalDays / intervalDays) + 1, clamped to ≥2.
  const N = Math.max(2, Math.round(totalDays / intervalDays) + 1);
  const stepMs = (safeFinal.getTime() - today.getTime()) / (N - 1);

  const dates: Date[] = [];
  for (let i = 0; i < N; i++) {
    if (i === 0) {
      dates.push(today);
    } else if (i === N - 1) {
      dates.push(safeFinal);
    } else {
      dates.push(new Date(today.getTime() + Math.round(i * stepMs)));
    }
  }
  return dates;
}

/**
 * Build the installment due dates for a custom host-supplied schedule.
 * Past-due dates are clamped to today, percents are kept as-is.
 */
function buildCustomDueDates(splits: CustomSplit[]): Date[] {
  const today = new Date();
  return splits.map((s) => clampDate(new Date(s.dueAt), today));
}

/**
 * Distribute amounts across installments. The final installment absorbs any
 * sub-dollar rounding so the sum exactly equals the total.
 */
function distributeAmounts(total: number, percents: number[]): number[] {
  const safeTotal = Math.max(0, Math.round(total));
  const amounts = percents.map((p) => Math.round(safeTotal * p));
  const drift = safeTotal - amounts.reduce((a, b) => a + b, 0);
  if (amounts.length > 0) {
    amounts[amounts.length - 1] += drift;
  }
  return amounts;
}

/**
 * Build the schedule for a given trip + strategy.
 */
export function computeInstallments(
  totalAmount: number,
  tripStartDateIso: string,
  schedule: PaymentSchedule = DEFAULT_SCHEDULE,
  customSplits?: CustomSplit[]
): Installment[] {
  const tripStart = new Date(tripStartDateIso);

  let dueDates: Date[];
  let percents: number[];

  if (schedule === "custom") {
    const splits =
      customSplits && customSplits.length >= 2
        ? customSplits
        : // If custom was selected but no splits provided, fall back to an
          // even biweekly schedule so the UI still renders.
          null;

    if (splits) {
      dueDates = buildCustomDueDates(splits);
      percents = splits.map((s) => s.percent);
    } else {
      dueDates = buildIntervalDueDates(tripStart, 14);
      percents = dueDates.map(() => 1 / dueDates.length);
    }
  } else {
    const intervalDays = schedule === "weekly" ? 7 : 14;
    dueDates = buildIntervalDueDates(tripStart, intervalDays);
    percents = dueDates.map(() => 1 / dueDates.length);
  }

  const amounts = distributeAmounts(totalAmount, percents);
  const N = dueDates.length;

  return dueDates.map((d, i) => ({
    index: i + 1,
    label: labelFor(i + 1, N),
    percent: percents[i],
    amount: amounts[i],
    dueAt: d.toISOString(),
  }));
}

/**
 * Whether installments are eligible given how close the trip start is. Hosts
 * can enable the toggle, but if the trip is starting in fewer than
 * INSTALLMENTS_MIN_HOURS hours, the schedule collapses, so the option is
 * suppressed at checkout.
 */
export function installmentsEligible(tripStartDateIso: string): boolean {
  return hoursUntilStart(tripStartDateIso) >= INSTALLMENTS_MIN_HOURS;
}

export function hoursUntilStart(tripStartDateIso: string): number {
  const start = new Date(tripStartDateIso).getTime();
  const now = Date.now();
  return Math.ceil((start - now) / (60 * 60_000));
}

export function daysUntilStart(tripStartDateIso: string): number {
  const start = new Date(tripStartDateIso).getTime();
  const now = Date.now();
  return Math.ceil((start - now) / MS_PER_DAY);
}

export function formatInstallmentDue(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Validate a custom split list. Returns null when valid, else a string error.
 */
export function validateCustomSplits(splits: CustomSplit[]): string | null {
  if (!splits || splits.length < 2) {
    return "Add at least 2 installments.";
  }
  const sum = splits.reduce((a, b) => a + (Number(b.percent) || 0), 0);
  if (Math.abs(sum - 1) > 0.005) {
    return `Percentages must add up to 100% (currently ${(sum * 100).toFixed(0)}%).`;
  }
  for (const s of splits) {
    if (!s.dueAt) return "Every installment needs a due date.";
    if (!(s.percent > 0)) return "Every installment needs a percentage greater than 0.";
  }
  return null;
}
