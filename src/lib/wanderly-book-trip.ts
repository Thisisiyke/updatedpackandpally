import type { Trip } from "@/types";
import {
  wanderlyBookingAmounts,
  schedulePayDateOneWeekBefore,
} from "@/lib/wanderly-booking-math";

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
  const charge = isPartial ? math.GrandpartialAmt : math.GrandFullAmt;
  const scheduleDateToPay = schedulePayDateOneWeekBefore(input.trip.startDate);
  const amountToPay = isPartial
    ? (math.GrandFullAmt - math.GrandpartialAmt).toFixed(2)
    : "0";

  return {
    amountPaid: [
      {
        installment1: charge,
        paymentId: input.paymentIntentId,
        customerId: input.customerId || "",
        serviceFee: isPartial ? math.partialAmtServiceFee : math.fullAmtServiceFee,
        taxFee: isPartial ? math.partialAmtTax : math.fullAmtTax,
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
    serviceFee: isPartial ? math.partialAmtServiceFee : math.fullAmtServiceFee,
    taxFee: isPartial ? math.partialAmtTax : math.fullAmtTax,
    endDate: input.trip.endDate,
    scheduleDateToPay,
    amountToPay,
    mobile: input.mobile.replace(/\D/g, ""),
    refundBeforeDays: "60",
    refundDescription: "Full refund 60+ days before trip; 5% fee < 60 days; 20% fee < 48 hours. Host cancellation = full refund.",
  };
}
