"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Download,
  Mail,
  Plane,
  Hotel as HotelIcon,
  MapPin,
  Clock,
  Phone,
  ChevronRight,
  MessageCircle,
  PartyPopper,
  Compass,
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/flight-generator";
import { formatHotelPrice } from "@/lib/hotel-generator";
import { TravelerInstallmentDateEditor } from "@/components/bookings/traveler-installment-date-editor";

interface StoredBooking {
  bookingId: string;
  type: "flight" | "hotel" | "trip";
  createdAt: string;
  contact: { firstName: string; lastName: string; email: string; phone: string };
  totalPrice: number;
  flight: any;
  hotel: any;
  room: any;
  trip: any;
  checkIn: string | null;
  checkOut: string | null;
  guests: number | null;
  rooms: number | null;
  departDate: string | null;
  returnDate: string | null;
  passengers: number | null;
  specialRequests: string;
}

type WanderlyConfirmPayload = {
  booking: Record<string, unknown>;
  trip: {
    title?: string;
    destination?: string;
    country?: string;
    startDate?: string;
    endDate?: string;
    coverImage?: string;
  };
};

function ConfirmedContent({ id }: { id: string }) {
  const [booking, setBooking] = useState<StoredBooking | null>(null);
  const [wanderly, setWanderly] = useState<WanderlyConfirmPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const rawSession = sessionStorage.getItem(`pp_confirm_${id}`);
      if (rawSession) {
        const parsed = JSON.parse(rawSession) as WanderlyConfirmPayload;
        if (parsed?.booking && parsed?.trip) {
          const b = parsed.booking;
          const parts = Array.isArray(b.amountPaid) ? b.amountPaid : [];
          const first = parts[0] as { installment1?: string } | undefined;
          const paid = first ? Number(first.installment1 || 0) : 0;
          const toPay = Number(b.amountToPay ?? 0);
          const partial = b.paymentStatus === "partial";
          const total = partial ? paid + toPay : paid;
          setWanderly(parsed as WanderlyConfirmPayload);
          setBooking({
            bookingId: id,
            type: "trip",
            createdAt: new Date(Number(b.timestamp ?? Date.now())).toISOString(),
            contact: {
              firstName: String(b.firstName ?? ""),
              lastName: String(b.lastName ?? ""),
              email: String(b.email ?? ""),
              phone: String(b.mobile ?? ""),
            },
            totalPrice: total || paid,
            flight: null,
            hotel: null,
            room: null,
            trip: parsed.trip,
            checkIn: String(b.startDate ?? ""),
            checkOut: String(b.endDate ?? ""),
            guests: Number(b.bookedCount ?? 1),
            rooms: null,
            departDate: null,
            returnDate: null,
            passengers: null,
            specialRequests: "",
          });
          setLoading(false);
          return;
        }
      }
    } catch {
      /* fall through */
    }
    try {
      const bookings = JSON.parse(
        localStorage.getItem("packpally_bookings") || "[]"
      );
      const found = bookings.find((b: StoredBooking) => b.bookingId === id);
      setBooking(found || null);
    } catch {
      setBooking(null);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading your booking...
      </div>
    );
  }

  if (!booking) {
    return (
      <Container className="py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Booking not found</h1>
          <p className="text-muted-foreground mt-2">
            We couldn&apos;t find this booking. It may have expired.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </Container>
    );
  }

  const isFlight = booking.type === "flight";
  const isTrip = booking.type === "trip";
  const wanderlyTrip = wanderly?.trip;
  const tripCardData: WanderlyConfirmPayload["trip"] | undefined =
    wanderlyTrip ??
    (booking.trip
      ? (booking.trip as WanderlyConfirmPayload["trip"])
      : undefined);
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const wanderlyBookingIdRaw =
    wanderly?.booking != null ? wanderly.booking._id : undefined;
  const showWanderlyInstallmentEditor = Boolean(
    isTrip &&
      wanderly != null &&
      wanderlyBookingIdRaw != null &&
      String(wanderlyBookingIdRaw).length > 0
  );

  return (
    <section className="bg-muted/20 pb-16 min-h-[calc(100vh-4rem)]">
      <Container className="py-12">
        {/* Success header */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 animate-[scale-in_500ms_cubic-bezier(0.16,1,0.3,1)]">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 animate-[scale-in_400ms_cubic-bezier(0.16,1,0.3,1)_200ms_both]" />
            </div>
          </div>

          <div className="flex justify-center mb-2">
            <PartyPopper className="h-5 w-5 text-amber-500 animate-[bounce_1s_ease-in-out_400ms_both]" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl animate-[fade-in-up_500ms_ease-out_300ms_both]">
            Booking confirmed!
          </h1>
          <p className="mt-3 text-muted-foreground animate-[fade-in-up_500ms_ease-out_400ms_both]">
            Thank you, {booking.contact.firstName}. Your{" "}
            {isFlight ? "flight" : isTrip ? "trip" : "stay"} is all set.
            We&apos;ve sent a confirmation to{" "}
            <strong>{booking.contact.email}</strong>.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm animate-[fade-in-up_500ms_ease-out_500ms_both]">
            <span className="text-muted-foreground">Booking ID:</span>
            <span className="font-bold font-mono">{booking.bookingId}</span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Booking details */}
          <div className="rounded-2xl border bg-white p-6 animate-[fade-in-up_500ms_ease-out_600ms_both]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                {isFlight ? (
                  <Plane className="h-5 w-5 text-primary rotate-45" />
                ) : isTrip ? (
                  <Compass className="h-5 w-5 text-primary" />
                ) : (
                  <HotelIcon className="h-5 w-5 text-primary" />
                )}
                {isFlight
                  ? "Flight details"
                  : isTrip
                    ? "Trip details"
                    : "Stay details"}
              </h2>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                Confirmed
              </Badge>
            </div>

            {isFlight && booking.flight ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-muted/30 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {booking.flight.segments[0].departure.time}
                      </p>
                      <p className="text-sm font-medium">
                        {booking.flight.segments[0].departure.airport.code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.flight.segments[0].departure.airport.city}
                      </p>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="h-px flex-1 bg-border" />
                        <Plane className="mx-2 h-4 w-4 text-primary rotate-45" />
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <p className="text-center text-xs text-muted-foreground mt-1">
                        {formatDuration(booking.flight.totalDuration)} ·{" "}
                        {booking.flight.stops === 0
                          ? "Direct"
                          : `${booking.flight.stops} stop${booking.flight.stops > 1 ? "s" : ""}`}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {
                          booking.flight.segments[
                            booking.flight.segments.length - 1
                          ].arrival.time
                        }
                      </p>
                      <p className="text-sm font-medium">
                        {
                          booking.flight.segments[
                            booking.flight.segments.length - 1
                          ].arrival.airport.code
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {
                          booking.flight.segments[
                            booking.flight.segments.length - 1
                          ].arrival.airport.city
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Airline</p>
                    <p className="text-sm font-medium">
                      {booking.flight.segments[0].airline.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Departure</p>
                    <p className="text-sm font-medium">
                      {booking.departDate &&
                        new Date(booking.departDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Passengers</p>
                    <p className="text-sm font-medium">{booking.passengers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cabin</p>
                    <p className="text-sm font-medium capitalize">
                      {booking.flight.cabin}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {!isFlight && booking.hotel ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={booking.hotel.coverImage}
                      alt={booking.hotel.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{booking.hotel.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {booking.hotel.address}
                    </p>
                    {booking.room && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.room.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-xl bg-muted/30 p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Check-in</p>
                    <p className="text-sm font-semibold">
                      {booking.checkIn &&
                        new Date(booking.checkIn).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      After {booking.hotel.policies.checkIn}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Check-out</p>
                    <p className="text-sm font-semibold">
                      {booking.checkOut &&
                        new Date(booking.checkOut).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Before {booking.hotel.policies.checkOut}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Guests</p>
                    <p className="text-sm font-semibold">{booking.guests}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rooms</p>
                    <p className="text-sm font-semibold">{booking.rooms}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {isTrip && tripCardData ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  {tripCardData.coverImage ? (
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={tripCardData.coverImage}
                        alt={tripCardData.title ?? "Trip"}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  ) : null}
                  <div>
                    <h3 className="font-bold text-lg">{tripCardData.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {tripCardData.destination}
                      {tripCardData.country
                        ? `, ${tripCardData.country}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 rounded-xl bg-muted/30 p-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Start</p>
                    <p className="font-semibold">
                      {booking.checkIn &&
                        formatDate(booking.checkIn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End</p>
                    <p className="font-semibold">
                      {booking.checkOut &&
                        formatDate(booking.checkOut)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Travelers</p>
                    <p className="font-semibold">{booking.guests}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {showWanderlyInstallmentEditor ? (
            <TravelerInstallmentDateEditor
              bookingId={String(wanderlyBookingIdRaw)}
              tripStartDate={String(
                wanderly!.booking.startDate ||
                  wanderly!.trip?.startDate ||
                  booking.checkIn ||
                  ""
              )}
              paymentStatus={String(wanderly!.booking.paymentStatus ?? "")}
              amountToPay={wanderly!.booking.amountToPay as number | string}
              plan={
                wanderly!.booking.installmentPlan as
                  | {
                      installments: {
                        index: number;
                        amount: number;
                        dueAt: string;
                      }[];
                    }
                  | null
                  | undefined
              }
              onSaved={(next) => {
                setWanderly((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    booking: {
                      ...prev.booking,
                      installmentPlan: next.installmentPlan as unknown as Record<
                        string,
                        unknown
                      >,
                      scheduleDateToPay: next.scheduleDateToPay,
                    },
                  };
                });
                try {
                  const rawSession = sessionStorage.getItem(`pp_confirm_${id}`);
                  if (rawSession) {
                    const parsed = JSON.parse(rawSession) as WanderlyConfirmPayload;
                    parsed.booking = {
                      ...parsed.booking,
                      installmentPlan:
                        next.installmentPlan as unknown as Record<string, unknown>,
                      scheduleDateToPay: next.scheduleDateToPay,
                    };
                    sessionStorage.setItem(
                      `pp_confirm_${id}`,
                      JSON.stringify(parsed)
                    );
                  }
                } catch {
                  /* ignore */
                }
              }}
            />
          ) : null}


          {/* Contact info */}
          <div className="rounded-2xl border bg-white p-6 animate-[fade-in-up_500ms_ease-out_700ms_both]">
            <h2 className="text-lg font-bold mb-4">Contact information</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">
                  {booking.contact.firstName} {booking.contact.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{booking.contact.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{booking.contact.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total paid</p>
                <p className="text-sm font-bold">
                  {formatHotelPrice(booking.totalPrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="rounded-2xl border bg-white p-6 animate-[fade-in-up_500ms_ease-out_800ms_both]">
            <h2 className="text-lg font-bold mb-4">What&apos;s next?</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Check your email</p>
                  <p className="text-xs text-muted-foreground">
                    A confirmation and receipt have been sent to{" "}
                    {booking.contact.email}
                  </p>
                </div>
              </div>
              {isFlight && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Online check-in</p>
                    <p className="text-xs text-muted-foreground">
                      Opens 24 hours before departure. We&apos;ll remind you.
                    </p>
                  </div>
                </div>
              )}
              {!isFlight && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Know before you go</p>
                    <p className="text-xs text-muted-foreground">
                      Hotel address, contact info, and directions will be
                      emailed 24 hours before check-in.
                    </p>
                  </div>
                </div>
              )}
              {isTrip && (
                <Link
                  href="/dashboard"
                  className="flex items-start gap-3 -mx-2 rounded-lg px-2 py-1 hover:bg-muted/50 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      You&apos;ve joined the trip group chat
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Meet your host and fellow travelers — open Messages to say
                      hi
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </Link>
              )}
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Need help?</p>
                  <p className="text-xs text-muted-foreground">
                    Our 24/7 support team is here for you at support@packandpally.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row animate-[fade-in-up_500ms_ease-out_900ms_both]">
            <Button variant="outline" size="lg" className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download receipt
            </Button>
            <Button size="lg" className="flex-1 gap-2" asChild>
              <Link href="/dashboard">
                View in Dashboard
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Back to home
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function ConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ConfirmedContent id={id} />;
}
