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

  // Partial = pay in 3 equal installments. Today's Stripe charge is
  // installment 1 (≈ 1/3 of grand total); installments 2 + 3 are collected
  // later via the existing paylater cron, summed into `amountToPay`.
  const installmentSchedule = isPartial
    ? computeInstallments(
        Math.round(math.GrandFullAmt),
        input.trip.startDate
      )
    : null;
  const charge = installmentSchedule
    ? installmentSchedule[0].amount
    : math.GrandFullAmt;
  const scheduleDateToPay = schedulePayDateOneWeekBefore(input.trip.startDate);
  const amountToPay = installmentSchedule
    ? (installmentSchedule[1].amount + installmentSchedule[2].amount).toFixed(2)
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
    mobile: input.mobile.replace(/\D/g, ""),
    refundBeforeDays: "60",
    refundDescription: "Full refund 60+ days before trip; 5% fee < 60 days; 20% fee < 48 hours. Host cancellation = full refund.",
  };
}
