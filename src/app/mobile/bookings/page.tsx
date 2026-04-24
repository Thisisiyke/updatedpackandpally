"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Plane,
  Hotel as HotelIcon,
  Compass,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BottomTabs } from "@/components/mobile/bottom-tabs";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { trips } from "@/data/trips";
import {
  getSurveyForTrip,
  getResponseForBooking,
  subscribeToSurveys,
} from "@/data/surveys";
import {
  getAllRemindersForMe,
  isReminderRead,
  subscribeToNotifications,
} from "@/lib/notifications";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type BookingStatus = "upcoming" | "past" | "cancelled";

const mockBookings = [
  {
    id: "b1",
    type: "trip" as const,
    tripId: trips[0].id,
    title: trips[0].title,
    image: trips[0].coverImage,
    destination: trips[0].destination,
    country: trips[0].country,
    startDate: trips[0].startDate,
    endDate: trips[0].endDate,
    status: "upcoming" as BookingStatus,
    price: trips[0].price,
  },
  {
    id: "b2",
    type: "hotel" as const,
    tripId: null,
    title: "Kyoto Zen Garden Residences",
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80",
    destination: "Kyoto",
    country: "Japan",
    startDate: "2026-05-20",
    endDate: "2026-05-24",
    status: "upcoming" as BookingStatus,
    price: 1340,
  },
  {
    id: "b3",
    type: "flight" as const,
    tripId: null,
    title: "New York → Paris",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
    destination: "Paris",
    country: "France",
    startDate: "2026-06-01",
    endDate: "2026-06-08",
    status: "upcoming" as BookingStatus,
    price: 820,
  },
  {
    id: "b4",
    type: "trip" as const,
    tripId: trips[0].id, // past Amalfi — where we have AI-survey data seeded
    title: trips[0].title,
    image: trips[0].coverImage,
    destination: trips[0].destination,
    country: trips[0].country,
    startDate: "2025-09-14",
    endDate: "2025-09-21",
    status: "past" as BookingStatus,
    price: trips[0].price,
  },
];

const typeIcons = {
  trip: Compass,
  flight: Plane,
  hotel: HotelIcon,
};

const typeColors = {
  trip: "text-violet-600 bg-violet-50",
  flight: "text-blue-600 bg-blue-50",
  hotel: "text-emerald-600 bg-emerald-50",
};

export default function MobileBookingsPage() {
  const [filter, setFilter] = useState<BookingStatus>("upcoming");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsubA = subscribeToSurveys(() => setTick((t) => t + 1));
    const unsubB = subscribeToNotifications(() => setTick((t) => t + 1));
    return () => {
      unsubA();
      unsubB();
    };
  }, []);

  const filtered = mockBookings.filter((b) => b.status === filter);
  void tick;

  // Unread payment reminders targeted at "me" for each booking
  const unreadReminderByBookingId = (() => {
    const map = new Map<string, string>(); // bookingId -> reminder id
    for (const r of getAllRemindersForMe()) {
      if (isReminderRead(r.id)) continue;
      for (const bid of r.recipientBookingIds) {
        if (!map.has(bid)) map.set(bid, r.id);
      }
    }
    return map;
  })();

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="My Trips" showBack={false} />

      {/* Tabs */}
      <div className="bg-white px-5 pb-3 border-b">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {[
            { value: "upcoming", label: "Upcoming" },
            { value: "past", label: "Past" },
            { value: "cancelled", label: "Cancelled" },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value as BookingStatus)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
                filter === t.value
                  ? "bg-white shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((booking) => {
            const TypeIcon = typeIcons[booking.type];
            const surveyEligible =
              booking.status === "past" &&
              booking.type === "trip" &&
              !!booking.tripId &&
              !!getSurveyForTrip(booking.tripId)?.enabled &&
              !getResponseForBooking(booking.id);

            const unreadReminderId = unreadReminderByBookingId.get(booking.id);

            return (
              <div key={booking.id} className="space-y-2">
                {unreadReminderId && (
                  <Link
                    href={`/mobile/notifications/${unreadReminderId}`}
                    className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 shrink-0">
                      <Wallet className="h-4 w-4 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                        Payment reminder from your host
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      </p>
                      <p className="text-[11px] text-amber-900/80">
                        Tap to read and settle your balance
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-amber-700 self-center shrink-0" />
                  </Link>
                )}
                {surveyEligible && (
                  <Link
                    href={`/mobile/surveys/${booking.id}`}
                    className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-violet-500/5 p-3 hover:from-primary/10 transition-colors"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 shrink-0">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">
                        How was your trip?
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {booking.title.split(" of ").pop() || booking.title}{" "}
                        · quick AI survey from your host
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground self-center shrink-0" />
                  </Link>
                )}
                <Link
                  href={
                    booking.type === "trip"
                      ? `/mobile/trips/${trips[0].id}`
                      : booking.type === "hotel"
                      ? "/mobile/search/hotels"
                      : "/mobile/search/flights"
                }
                className="block rounded-2xl bg-white border overflow-hidden"
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={booking.image}
                    alt={booking.title}
                    fill
                    className="object-cover"
                    sizes="360px"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full",
                        typeColors[booking.type]
                      )}
                    >
                      <TypeIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 capitalize">
                      {booking.type}
                    </span>
                  </div>
                  <Badge
                    className={cn(
                      "absolute top-3 right-3 text-[10px]",
                      filter === "upcoming" &&
                        "bg-emerald-100 text-emerald-800 border-emerald-200",
                      filter === "past" &&
                        "bg-blue-100 text-blue-800 border-blue-200",
                      filter === "cancelled" &&
                        "bg-red-100 text-red-800 border-red-200"
                    )}
                  >
                    {filter === "upcoming" && <Clock className="h-2.5 w-2.5 mr-0.5" />}
                    {filter === "past" && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                    {filter === "cancelled" && <XCircle className="h-2.5 w-2.5 mr-0.5" />}
                    {filter === "upcoming" ? "Confirmed" : filter === "past" ? "Completed" : "Cancelled"}
                  </Badge>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm leading-tight line-clamp-1">
                    {booking.title}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {booking.destination}, {booking.country}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(booking.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" - "}
                      {new Date(booking.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-sm font-bold">
                      ${booking.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Compass className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-semibold">No {filter} trips</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your {filter} bookings will appear here
            </p>
          </div>
        )}
      </div>

      <BottomTabs />
    </div>
  );
}
