"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  PartyPopper,
  Plane,
  Hotel as HotelIcon,
  Compass,
  Download,
  Mail,
  Calendar,
  Users,
  MapPin,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function MobileConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem("packpally_bookings") || "[]");
      const found = list.find((b: any) => b.bookingId === id);
      setBooking(found || null);
    } catch {}
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="h-full min-h-[844px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="h-full min-h-[844px] flex items-center justify-center p-6 text-center">
        <div>
          <p className="font-semibold">Booking not found</p>
          <Button asChild className="mt-4">
            <Link href="/mobile/home">Back home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isFlight = booking.type === "flight";
  const isHotel = booking.type === "hotel";
  const isTrip = booking.type === "trip";

  const TypeIcon = isFlight ? Plane : isHotel ? HotelIcon : Compass;
  const title = isFlight
    ? `${booking.flight?.segments[0]?.departure?.airport?.code} → ${
        booking.flight?.segments[booking.flight.segments.length - 1]?.arrival
          ?.airport?.code
      }`
    : isHotel
    ? booking.hotel?.name
    : booking.trip?.title;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <div className="flex-1 overflow-y-auto">
        {/* Success hero */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white px-6 pt-16 md:pt-20 pb-10 text-center relative overflow-hidden">
          {/* Confetti dots */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/30 animate-[sparkle_3s_ease-in-out_infinite]"
              style={{
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 100}%`,
                width: `${4 + Math.random() * 6}px`,
                height: `${4 + Math.random() * 6}px`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}

          <div className="relative">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm mb-3 animate-[scale-in_500ms_cubic-bezier(0.16,1,0.3,1)]">
              <CheckCircle2 className="h-10 w-10 text-white animate-[scale-in_500ms_cubic-bezier(0.16,1,0.3,1)_200ms_both]" />
            </div>
            <PartyPopper className="h-5 w-5 mx-auto mb-2 animate-[bounce_1s_ease-in-out_400ms_both]" />
            <h1 className="text-2xl font-extrabold tracking-tight animate-[fade-in-up_500ms_ease-out_300ms_both]">
              Booking confirmed!
            </h1>
            <p className="mt-2 text-sm text-white/90 animate-[fade-in-up_500ms_ease-out_400ms_both]">
              Your {isFlight ? "flight" : isHotel ? "stay" : "adventure"} is all set
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs animate-[fade-in-up_500ms_ease-out_500ms_both]">
              <span className="opacity-80">ID:</span>
              <span className="font-bold font-mono">{booking.bookingId}</span>
            </div>
          </div>
        </div>

        {/* Booking details */}
        <div className="px-4 -mt-5 relative z-10 space-y-3">
          <div className="rounded-2xl bg-white border overflow-hidden">
            {(isHotel || isTrip) && (
              <div className="relative h-32 w-full">
                <Image
                  src={
                    booking.hotel?.coverImage ||
                    booking.trip?.coverImage ||
                    ""
                  }
                  alt=""
                  fill
                  className="object-cover"
                  sizes="360px"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                  Confirmed
                </Badge>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground capitalize">
                  <TypeIcon className="h-3 w-3" />
                  {booking.type}
                </div>
              </div>
              <h2 className="font-bold text-sm">{title}</h2>
              {isFlight && (
                <div className="mt-3 rounded-xl bg-muted/30 p-3 flex items-center gap-3">
                  <div className="text-center">
                    <p className="font-bold">
                      {booking.flight.segments[0].departure.time}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {booking.flight.segments[0].departure.airport.code}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <Plane className="h-3 w-3 text-primary rotate-45" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold">
                      {booking.flight.segments[booking.flight.segments.length - 1].arrival.time}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {booking.flight.segments[booking.flight.segments.length - 1].arrival.airport.code}
                    </p>
                  </div>
                </div>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {isFlight && booking.departDate && (
                  <div>
                    <p className="text-[10px] text-muted-foreground">Departure</p>
                    <p className="text-xs font-semibold">
                      {new Date(booking.departDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                )}
                {isHotel && (
                  <>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Check-in</p>
                      <p className="text-xs font-semibold">
                        {new Date(booking.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Check-out</p>
                      <p className="text-xs font-semibold">
                        {new Date(booking.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </>
                )}
                {isTrip && (
                  <>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Duration</p>
                      <p className="text-xs font-semibold">
                        {booking.trip?.durationDays} days
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Destination</p>
                      <p className="text-xs font-semibold truncate">
                        {booking.trip?.destination}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-2xl bg-white border p-4">
            <h3 className="font-bold text-xs mb-2">Contact</h3>
            <div className="space-y-0.5 text-xs">
              <p className="font-medium">
                {booking.contact.firstName} {booking.contact.lastName}
              </p>
              <p className="text-muted-foreground">{booking.contact.email}</p>
            </div>
          </div>

          {/* What's next */}
          <div className="rounded-2xl bg-white border p-4">
            <h3 className="font-bold text-xs mb-3">What's next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium">Confirmation email sent</p>
                  <p className="text-[10px] text-muted-foreground">
                    Check {booking.contact.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium">Added to My Trips</p>
                  <p className="text-[10px] text-muted-foreground">
                    View anytime in the Bookings tab
                  </p>
                </div>
              </div>
              {isTrip && (
                <Link
                  href="/mobile/messages"
                  className="flex items-start gap-2 -mx-1 rounded-lg px-1 py-0.5 active:bg-muted/50 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">
                      You&apos;ve joined the trip group chat
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Meet your host and fellow travelers — say hi in Messages
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
                </Link>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="rounded-2xl bg-white border p-4 flex items-center justify-between">
            <span className="text-xs font-semibold">Total paid</span>
            <span className="text-lg font-bold">
              {formatPrice(booking.totalPrice)}
            </span>
          </div>

          <div className="h-4" />
        </div>
      </div>

      {/* Sticky CTAs */}
      <div className="sticky bottom-0 bg-white border-t p-4 md:pb-8 space-y-2">
        <Button asChild className="w-full h-12" size="lg">
          <Link href="/mobile/bookings">View my trips</Link>
        </Button>
        <Button variant="ghost" asChild className="w-full">
          <Link href="/mobile/home">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
