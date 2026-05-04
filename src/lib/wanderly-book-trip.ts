import type { Trip } from "@/types";
import {
  wanderlyBookingAmounts,
  schedulePayDateOneWeekBefore,
} from "@/lib/wanderly-booking-math";
import { computeInstallments } from "@/lib/installment-schedule";

export function buildBookTripBody(input: {
  trip: Trip;
  travelers: number;
  paymentMode: "full" | "partial";
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  userId: string;
  userProfileImg?: string | null;
  paymentIntentId: string;
  customerId?: string;
}) {
  const w = input.trip.wanderly;
  if (!w) throw new Error("Trip is missing wanderly metadata");
  const math = wanderlyBookingAmounts(
    input.trip.price,
    w.tripTax,
    input.travelers
  );
  const isPartial = input.paymentMode === "partial";

  // Partial = pay in N installments based on the host's chosen schedule.
  // `installmentPlan` is stored on the booking so travelers can adjust due
  // dates (not amounts) for unpaid installments after checkout.
  const installmentSchedule = isPartial
    ? computeInstallments(
        Math.round(math.GrandFullAmt),
        input.trip.startDate,
        input.trip.partialPayment?.schedule || "biweekly",
        input.trip.partialPayment?.customSplits
      )
    : null;
  const charge = installmentSchedule
    ? installmentSchedule[0].amount
    : math.GrandFullAmt;
  const scheduleDateToPay = schedulePayDateOneWeekBefore(input.trip.startDate);
  const amountToPay = installmentSchedule
    ? installmentSchedule
        .slice(1)
        .reduce((sum, s) => sum + s.amount, 0)
        .toFixed(2)
    : "0";

  // Service fee + tax on the partial leg are scaled to installment 1's share
  // of the full amount so percentages stay consistent with the new schedule.
  const partialShare = installmentSchedule
    ? installmentSchedule[0].amount / Math.round(math.GrandFullAmt)
    : 0;
  const partialServiceFee = Number(
    (math.fullAmtServiceFee * partialShare).toFixed(2)
  );
  const partialTax = Number((math.fullAmtTax * partialShare).toFixed(2));

  const installmentPlan =
    isPartial && installmentSchedule && installmentSchedule.length > 0
      ? {
          installments: installmentSchedule.map((s) => ({
            index: s.index,
            amount: s.amount,
            dueAt: s.dueAt,
          })),
        }
      : undefined;

  return {
    amountPaid: [
      {
        installment1: charge,
        paymentId: input.paymentIntentId,
        customerId: input.customerId || "",
        serviceFee: isPartial ? partialServiceFee : math.fullAmtServiceFee,
        taxFee: isPartial ? partialTax : math.fullAmtTax,
      },
    ],
    tripId: w._id,
    userId: input.userId,
    tripTimestamp: w.timestamp,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    adminId: input.trip.hostId,
    paymentStatus: input.paymentMode,
    bookedCount: input.travelers,
    tripImages: input.trip.images,
    tripName: input.trip.title,
    destination: input.trip.destination,
    startDate: input.trip.startDate,
    adminName: w.adminName || "Host",
    adminProfile: w.adminProfile || "",
    nights: w.nights || String(Math.max(0, input.trip.durationDays - 1)),
    mornings: w.mornings || String(input.trip.durationDays),
    userProfileImg: input.userProfileImg || "",
    serviceFee: isPartial ? partialServiceFee : math.fullAmtServiceFee,
    taxFee: isPartial ? partialTax : math.fullAmtTax,
    endDate: input.trip.endDate,
    scheduleDateToPay,
    amountToPay,
    ...(installmentPlan ? { installmentPlan } : {}),
    mobile: input.mobile.replace(/\D/g, ""),
    refundBeforeDays: "60",
    refundDescription: "Full refund 60+ days before trip; 5% fee < 60 days; 20% fee < 48 hours. Host cancellation = full refund.",
  };
}
