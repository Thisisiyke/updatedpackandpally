import { Booking } from "@/types";

export const bookings: Booking[] = [
  {
    id: "booking-1",
    tripId: "trip-1",
    userId: "user-1",
    status: "confirmed",
    bookedDate: "2026-03-10",
    travelers: 2,
    totalPrice: 4998,
  },
  {
    id: "booking-2",
    tripId: "trip-5",
    userId: "user-1",
    status: "pending",
    bookedDate: "2026-04-01",
    travelers: 1,
    totalPrice: 2199,
  },
  {
    id: "booking-3",
    tripId: "trip-3",
    userId: "user-1",
    status: "confirmed",
    bookedDate: "2026-02-15",
    travelers: 1,
    totalPrice: 4299,
  },
];
