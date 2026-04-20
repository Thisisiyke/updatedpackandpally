"use client";

import { Suspense, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  CreditCard,
  Lock,
  User,
  Mail,
  Phone,
  Plane,
  Hotel as HotelIcon,
  Compass,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { generateFlights, formatDuration, formatPrice } from "@/lib/flight-generator";
import { generateHotels, calculateNights, formatHotelPrice } from "@/lib/hotel-generator";
import { trips } from "@/data/trips";
import { cn } from "@/lib/utils";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // flight | hotel | trip

  // Flight
  const flightId = searchParams.get("flightId");
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const departDate = searchParams.get("departDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const passengers = Number(searchParams.get("passengers") || "1");
  const cabin = (searchParams.get("cabin") || "economy") as any;

  // Hotel
  const hotelId = searchParams.get("hotelId");
  const roomId = searchParams.get("roomId");
  const location = searchParams.get("location") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = Number(searchParams.get("guests") || "2");
  const rooms = Number(searchParams.get("rooms") || "1");

  // Trip
  const tripId = searchParams.get("tripId");

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [processing, setProcessing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const flights = useMemo(() => {
    if (type !== "flight") return [];
    return generateFlights({
      origin, destination, departDate,
      returnDate, passengers, cabin,
      tripType: "roundtrip",
    });
  }, [type, origin, destination, departDate, returnDate, passengers, cabin]);

  const hotels = useMemo(() => {
    if (type !== "hotel") return [];
    return generateHotels({ location, checkIn, checkOut, guests, rooms });
  }, [type, location, checkIn, checkOut, guests, rooms]);

  const selectedFlight = type === "flight" ? flights.find((f) => f.id === flightId) : null;
  const selectedHotel = type === "hotel" ? hotels.find((h) => h.id === hotelId) : null;
  const selectedRoom = selectedHotel?.roomTypes.find((r) => r.id === roomId) || selectedHotel?.roomTypes[0];
  const selectedTrip = type === "trip" ? trips.find((t) => t.id === tripId) : null;

  const nights = type === "hotel" ? calculateNights(checkIn, checkOut) : 0;

  const subtotal = selectedFlight
    ? selectedFlight.price
    : selectedRoom && nights > 0
    ? selectedRoom.pricePerNight * nights
    : selectedTrip
    ? selectedTrip.price
    : 0;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  if (!selectedFlight && !selectedHotel && !selectedTrip) {
    return (
      <div className="flex flex-col h-full min-h-[844px]">
        <MobileHeader title="Checkout" />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <p className="font-semibold">Booking not found</p>
            <Button onClick={() => router.push("/mobile/home")} className="mt-4">Back home</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1300));
    const bookingId = `PP${Date.now().toString(36).toUpperCase()}`;

    const bookingData = {
      bookingId,
      type,
      createdAt: new Date().toISOString(),
      contact: { firstName, lastName, email, phone },
      totalPrice: total,
      flight: selectedFlight || null,
      hotel: selectedHotel || null,
      room: selectedRoom || null,
      trip: selectedTrip || null,
      checkIn: type === "hotel" ? checkIn : null,
      checkOut: type === "hotel" ? checkOut : null,
      guests: type === "hotel" ? guests : null,
      rooms: type === "hotel" ? rooms : null,
      departDate: type === "flight" ? departDate : null,
      returnDate: type === "flight" ? returnDate : null,
      passengers: type === "flight" ? passengers : null,
    };

    try {
      const existing = JSON.parse(localStorage.getItem("packpally_bookings") || "[]");
      existing.push(bookingData);
      localStorage.setItem("packpally_bookings", JSON.stringify(existing));
    } catch {}

    router.push(`/mobile/confirmation/${bookingId}`);
  };

  const formatCardNumber = (v: string) =>
    v.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (v: string) => {
    const c = v.replace(/\D/g, "");
    return c.length >= 2 ? `${c.slice(0, 2)}/${c.slice(2, 4)}` : c;
  };

  const TypeIcon = type === "flight" ? Plane : type === "hotel" ? HotelIcon : Compass;
  const summaryTitle = selectedFlight
    ? `${origin} → ${destination}`
    : selectedHotel
    ? selectedHotel.name
    : selectedTrip?.title || "";
  const summarySubtitle = selectedFlight
    ? `${selectedFlight.segments[0].airline.name} · ${formatDuration(selectedFlight.totalDuration)}`
    : selectedHotel
    ? `${selectedRoom?.name} · ${nights} night${nights !== 1 ? "s" : ""}`
    : selectedTrip
    ? `${selectedTrip.destination} · ${selectedTrip.durationDays} days`
    : "";
  const summaryImage = selectedFlight
    ? null
    : selectedHotel?.coverImage || selectedTrip?.coverImage;

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Checkout" onBack={step > 1 ? () => setStep((step - 1) as any) : undefined} />

      {/* Step indicator */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: "Details" },
            { num: 2, label: "Payment" },
            { num: 3, label: "Review" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-1 flex-1">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
                  step >= s.num ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {step > s.num ? <Check className="h-3 w-3" /> : s.num}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  step >= s.num ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
              {i < 2 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-1",
                    step > s.num ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Booking summary */}
        <div className="rounded-2xl bg-white border p-3 flex gap-3">
          {summaryImage ? (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={summaryImage}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <TypeIcon className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{summaryTitle}</p>
            <p className="text-xs text-muted-foreground truncate">
              {summarySubtitle}
            </p>
          </div>
        </div>

        {step === 1 && (
          <div className="rounded-2xl bg-white border p-4 space-y-4">
            <div>
              <h2 className="font-bold text-sm">
                {type === "flight" ? "Traveler details" : "Guest details"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Enter details for the primary {type === "flight" ? "traveler" : "guest"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">First name</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Last name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="pl-9 h-11"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-2xl bg-white border p-4 space-y-4">
            <div>
              <h2 className="font-bold text-sm flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Payment
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Secure, encrypted checkout
              </p>
            </div>

            {/* Card preview */}
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <CreditCard className="h-6 w-6 text-white/70" />
                  <span className="text-xs font-semibold tracking-wider">VISA</span>
                </div>
                <p className="mt-6 text-sm tracking-widest font-mono">
                  {cardNumber || "•••• •••• •••• ••••"}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] opacity-60">HOLDER</p>
                    <p className="text-xs font-medium uppercase">
                      {cardName || "YOUR NAME"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] opacity-60">EXPIRES</p>
                    <p className="text-xs font-medium">{expiry || "MM/YY"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Card number</Label>
              <Input
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="h-11 font-mono"
                maxLength={19}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Cardholder name</Label>
              <Input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="As shown on card"
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Expiry</Label>
                <Input
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">CVC</Label>
                <Input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  className="h-11"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white border p-4">
              <h2 className="font-bold text-sm mb-3">Contact</h2>
              <div className="space-y-1 text-xs">
                <p className="font-medium">{firstName} {lastName}</p>
                <p className="text-muted-foreground">{email}</p>
                <p className="text-muted-foreground">{phone}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white border p-4">
              <h2 className="font-bold text-sm mb-3">Payment method</h2>
              <div className="flex items-center gap-2 text-xs">
                <CreditCard className="h-4 w-4" />
                <span>•••• {cardNumber.replace(/\s/g, "").slice(-4)}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white border p-4">
              <h2 className="font-bold text-sm mb-3">Price breakdown</h2>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatHotelPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Taxes & fees</span>
                  <span>{formatHotelPrice(taxes)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span className="text-base">{formatHotelPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-3 text-[10px] text-muted-foreground">
              By tapping &quot;Confirm and pay&quot; you agree to our Terms of
              Service, Privacy Policy, and the cancellation policy.
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom CTA */}
      <div className="sticky bottom-0 bg-white border-t p-4 md:pb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-lg font-bold">{formatHotelPrice(total)}</span>
        </div>
        {step < 3 ? (
          <Button
            className="w-full h-12"
            size="lg"
            onClick={() => setStep((step + 1) as any)}
            disabled={
              step === 1
                ? !firstName || !lastName || !email || !phone
                : !cardNumber || !cardName || !expiry || !cvc
            }
          >
            {step === 1 ? "Continue to payment" : "Review booking"}
          </Button>
        ) : (
          <Button
            className="w-full h-12 gap-2"
            size="lg"
            onClick={handleConfirm}
            disabled={processing}
          >
            {processing ? (
              "Processing..."
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Confirm and pay
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function MobileCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
