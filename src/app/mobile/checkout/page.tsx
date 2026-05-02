"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
import {
  depositAmount,
  remainingAmount,
  tripTotal,
  perPersonRate,
  DEPOSIT_PERCENT,
  calculatePriceBreakdown,
  formatRatePercent,
} from "@/lib/trip-pricing";
import {
  computeInstallments,
  installmentsEligible,
  formatInstallmentDue,
  daysUntilStart,
  INSTALLMENTS_MIN_DAYS,
} from "@/lib/installment-schedule";
import { trips } from "@/data/trips";
import { hosts } from "@/data/hosts";
import { joinTripGroupChat } from "@/hooks/use-conversations";
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
  const [travelerIdFile, setTravelerIdFile] = useState<{
    name: string;
    dataUrl: string;
    sizeBytes: number;
    type: string;
  } | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  const [socialLink, setSocialLink] = useState("");
  const idInputRef = useRef<HTMLInputElement>(null);

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdError(null);
    const ok =
      file.type === "application/pdf" ||
      file.type.startsWith("image/") ||
      /\.(pdf|jpg|jpeg|png|heic)$/i.test(file.name);
    if (!ok) {
      setIdError("Upload a PDF or image (JPG, PNG).");
      if (idInputRef.current) idInputRef.current.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setIdError("Keep it under 8 MB.");
      if (idInputRef.current) idInputRef.current.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setTravelerIdFile({
        name: file.name,
        dataUrl: String(reader.result || ""),
        sizeBytes: file.size,
        type: file.type,
      });
    reader.readAsDataURL(file);
    if (idInputRef.current) idInputRef.current.value = "";
  };

  const [tripTravelers, setTripTravelers] = useState(1);
  const [paymentMode, setPaymentMode] = useState<"full" | "partial">("full");

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

  // Force back to full when this trip's host enabled installments but the
  // schedule can't be built (trip is too soon).
  useEffect(() => {
    if (
      type === "trip" &&
      selectedTrip?.partialPayment?.enabled &&
      !installmentsEligible(selectedTrip.startDate) &&
      paymentMode === "partial"
    ) {
      setPaymentMode("full");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrip?.id]);

  const nights = type === "hotel" ? calculateNights(checkIn, checkOut) : 0;

  // For group trips, scale by traveler count and any tiered pricing on the trip
  const tripPricing = selectedTrip
    ? {
        rate: perPersonRate(selectedTrip.price, selectedTrip.priceTiers, tripTravelers),
        subtotal: tripTotal(selectedTrip.price, selectedTrip.priceTiers, tripTravelers),
      }
    : null;

  const subtotal = selectedFlight
    ? selectedFlight.price
    : selectedRoom && nights > 0
    ? selectedRoom.pricePerNight * nights
    : tripPricing
    ? tripPricing.subtotal
    : 0;
  const breakdown = calculatePriceBreakdown(subtotal, selectedTrip?.taxRate);
  const taxes = breakdown.tax + breakdown.platformFee;
  const total = breakdown.total;

  // Host opted into installments? Eligible only if the trip is far enough out.
  const installmentsAllowed =
    type === "trip" &&
    !!selectedTrip?.partialPayment?.enabled &&
    selectedTrip != null &&
    installmentsEligible(selectedTrip.startDate);
  const installmentsBlocked =
    type === "trip" &&
    !!selectedTrip?.partialPayment?.enabled &&
    !!selectedTrip &&
    !installmentsEligible(selectedTrip.startDate);
  const installmentSchedule =
    installmentsAllowed && selectedTrip
      ? computeInstallments(total, selectedTrip.startDate)
      : null;

  const amountDueNow =
    type === "trip" && paymentMode === "partial"
      ? installmentSchedule
        ? installmentSchedule[0].amount
        : depositAmount(total)
      : total;
  const amountDueLater =
    type === "trip" && paymentMode === "partial"
      ? installmentSchedule
        ? installmentSchedule[1].amount + installmentSchedule[2].amount
        : remainingAmount(total)
      : 0;

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
      contact: {
        firstName,
        lastName,
        email,
        phone,
        socialMediaUrl:
          type === "trip" && selectedTrip?.requestSocialMedia && socialLink.trim()
            ? socialLink.trim()
            : undefined,
        travelerId:
          type === "trip" && selectedTrip?.requireTravelerId && travelerIdFile
            ? {
                name: travelerIdFile.name,
                sizeBytes: travelerIdFile.sizeBytes,
                type: travelerIdFile.type,
                // dataUrl intentionally omitted from the saved booking to keep
                // localStorage light; in production this would be uploaded
                // server-side and only the URL/id stored.
              }
            : undefined,
      },
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
      tripTravelers: type === "trip" ? tripTravelers : null,
      paymentMode: type === "trip" ? paymentMode : "full",
      amountPaidNow: amountDueNow,
      amountDueLater,
      installments:
        type === "trip" && paymentMode === "partial" && installmentSchedule
          ? installmentSchedule.map((s) => ({
              index: s.index,
              label: s.label,
              dueAt: s.dueAt,
              amount: s.amount,
              paid: s.index === 1,
            }))
          : null,
    };

    try {
      const existing = JSON.parse(localStorage.getItem("packpally_bookings") || "[]");
      existing.push(bookingData);
      localStorage.setItem("packpally_bookings", JSON.stringify(existing));
    } catch {}

    if (selectedTrip) {
      const tripHost = hosts.find((h) => h.id === selectedTrip.hostId);
      joinTripGroupChat(selectedTrip, tripHost);
    }

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

            {/* Government ID upload — when host requires it */}
            {type === "trip" && selectedTrip?.requireTravelerId && (
              <div className="pt-4 border-t space-y-2">
                <div>
                  <Label className="text-xs">
                    Government ID <span className="text-red-600">*</span>
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Your host needs to verify each traveler. Upload a passport,
                    driver&apos;s license, or national ID (PDF or photo).
                  </p>
                </div>
                <input
                  ref={idInputRef}
                  type="file"
                  accept="application/pdf,image/*,.pdf,.jpg,.jpeg,.png,.heic"
                  onChange={handleIdUpload}
                  className="hidden"
                />
                {travelerIdFile ? (
                  <div className="rounded-xl border bg-muted/30 p-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
                      <Check className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {travelerIdFile.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {(travelerIdFile.sizeBytes / 1024).toFixed(0)} KB ·
                        Encrypted in transit
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTravelerIdFile(null)}
                      className="text-[11px] text-red-600 font-medium shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => idInputRef.current?.click()}
                    className="flex h-20 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed text-xs text-muted-foreground gap-1 hover:border-primary/40 hover:text-foreground transition-colors"
                  >
                    Tap to upload ID
                    <span className="text-[10px]">PDF or photo · up to 8 MB</span>
                  </button>
                )}
                {idError && (
                  <p className="text-[11px] text-red-600">{idError}</p>
                )}
              </div>
            )}

            {/* Social media link — when host asks for it */}
            {type === "trip" && selectedTrip?.requestSocialMedia && (
              <div className="pt-4 border-t space-y-1.5">
                <Label className="text-xs">
                  Social media profile{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  type="url"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                  placeholder="https://instagram.com/your_handle"
                  className="h-11"
                />
                <p className="text-[10px] text-muted-foreground">
                  Helps your trip group recognize each other before the trip.
                </p>
              </div>
            )}

            {/* Traveler count — trip bookings only */}
            {type === "trip" && selectedTrip && (
              <div className="pt-4 border-t space-y-2">
                <div>
                  <Label className="text-xs">How many travelers?</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Max group size: {selectedTrip.maxGroupSize}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setTripTravelers((n) => Math.max(1, n - 1))
                    }
                    disabled={tripTravelers <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full border disabled:opacity-40 transition-colors hover:bg-muted"
                    aria-label="Decrease travelers"
                  >
                    <span className="text-lg font-bold leading-none">−</span>
                  </button>

                  <div className="flex-1 text-center">
                    <p className="text-2xl font-extrabold leading-none">
                      {tripTravelers}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {tripTravelers === 1 ? "traveler" : "travelers"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setTripTravelers((n) =>
                        Math.min(
                          selectedTrip.maxGroupSize -
                            selectedTrip.currentBookings,
                          n + 1
                        )
                      )
                    }
                    disabled={
                      tripTravelers >=
                      selectedTrip.maxGroupSize - selectedTrip.currentBookings
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border disabled:opacity-40 transition-colors hover:bg-muted"
                    aria-label="Increase travelers"
                  >
                    <span className="text-lg font-bold leading-none">+</span>
                  </button>
                </div>

                {tripPricing && (
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        ${tripPricing.rate.toLocaleString()} × {tripTravelers}
                      </span>
                      <span>${tripPricing.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Tax ({formatRatePercent(breakdown.taxRate)})</span>
                      <span>${breakdown.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>
                        Platform fee ({formatRatePercent(breakdown.platformFeeRate)})
                      </span>
                      <span>${breakdown.platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold pt-1 border-t">
                      <span>Total</span>
                      <span>${breakdown.total.toLocaleString()}</span>
                    </div>
                    {selectedTrip.priceTiers && (
                      <p className="text-[10px] text-primary">
                        Group rate applied
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
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

            {/* Payment mode — trip bookings only */}
            {type === "trip" && (
              <div className="space-y-2 pb-2 border-b">
                <Label className="text-xs">Choose a payment option</Label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("full")}
                    className={cn(
                      "w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                      paymentMode === "full"
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "hover:bg-muted/30"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 mt-0.5",
                        paymentMode === "full"
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {paymentMode === "full" && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold">Pay in full</p>
                        <span className="text-sm font-bold">
                          ${total.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        One-time payment, nothing else to worry about
                      </p>
                    </div>
                  </button>

                  {installmentsAllowed && installmentSchedule ? (
                    <button
                      type="button"
                      onClick={() => setPaymentMode("partial")}
                      className={cn(
                        "w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                        paymentMode === "partial"
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                          : "hover:bg-muted/30"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 mt-0.5",
                          paymentMode === "partial"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {paymentMode === "partial" && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold">3 installments</p>
                          <span className="text-sm font-bold">
                            ${installmentSchedule[0].amount.toLocaleString()}{" "}
                            today
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Split into 3 equal payments — see schedule below.
                        </p>
                        {paymentMode === "partial" && (
                          <div className="mt-3 space-y-1.5">
                            {installmentSchedule.map((s) => (
                              <div
                                key={s.index}
                                className="flex items-center justify-between gap-2 rounded-md bg-white border px-2.5 py-1.5"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary shrink-0">
                                    {s.index}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-semibold leading-tight truncate">
                                      {s.label}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground leading-tight">
                                      Due {formatInstallmentDue(s.dueAt)}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-[11px] font-bold shrink-0">
                                  ${s.amount.toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ) : !installmentsBlocked ? (
                    <button
                      type="button"
                      onClick={() => setPaymentMode("partial")}
                      className={cn(
                        "w-full flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                        paymentMode === "partial"
                          ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                          : "hover:bg-muted/30"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 mt-0.5",
                          paymentMode === "partial"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {paymentMode === "partial" && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold">
                            Pay {Math.round(DEPOSIT_PERCENT * 100)}% deposit
                          </p>
                          <span className="text-sm font-bold">
                            ${depositAmount(total).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Remaining{" "}
                          <span className="font-semibold">
                            ${remainingAmount(total).toLocaleString()}
                          </span>{" "}
                          due 30 days before the trip
                        </p>
                      </div>
                    </button>
                  ) : null}

                  {installmentsBlocked && selectedTrip && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
                      <p className="font-semibold">
                        Partial payment isn&apos;t available for this trip.
                      </p>
                      <p className="mt-0.5 leading-snug">
                        The host enabled installments, but this trip is{" "}
                        {(() => {
                          const d = daysUntilStart(selectedTrip.startDate);
                          return d <= 0
                            ? "due"
                            : `${d} day${d === 1 ? "" : "s"} away`;
                        })()}{" "}
                        — installments need at least {INSTALLMENTS_MIN_DAYS}{" "}
                        days to schedule. Pay in full to confirm your spot.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                {type === "trip" && tripPricing ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      ${tripPricing.rate.toLocaleString()} × {tripTravelers}{" "}
                      {tripTravelers === 1 ? "traveler" : "travelers"}
                    </span>
                    <span>{formatHotelPrice(subtotal)}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatHotelPrice(subtotal)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Tax ({formatRatePercent(breakdown.taxRate)})
                  </span>
                  <span>{formatHotelPrice(breakdown.tax)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Platform fee ({formatRatePercent(breakdown.platformFeeRate)})
                  </span>
                  <span>{formatHotelPrice(breakdown.platformFee)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between font-bold">
                  <span>Total</span>
                  <span className="text-base">{formatHotelPrice(total)}</span>
                </div>
                {type === "trip" && paymentMode === "partial" && (
                  <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-900 font-semibold">
                        Due today ({Math.round(DEPOSIT_PERCENT * 100)}%)
                      </span>
                      <span className="font-bold text-amber-900">
                        {formatHotelPrice(amountDueNow)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-900/80">
                        Due 30 days before trip
                      </span>
                      <span className="font-semibold text-amber-900/80">
                        {formatHotelPrice(amountDueLater)}
                      </span>
                    </div>
                  </div>
                )}
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
          <span className="text-xs text-muted-foreground">
            {type === "trip" && paymentMode === "partial"
              ? "Due today"
              : "Total"}
          </span>
          <div className="text-right">
            <span className="text-lg font-bold block leading-none">
              {formatHotelPrice(amountDueNow)}
            </span>
            {type === "trip" && paymentMode === "partial" && (
              <span className="text-[10px] text-muted-foreground">
                + {formatHotelPrice(amountDueLater)} due later
              </span>
            )}
          </div>
        </div>
        {step < 3 ? (
          <Button
            className="w-full h-12"
            size="lg"
            onClick={() => setStep((step + 1) as any)}
            disabled={
              step === 1
                ? !firstName ||
                  !lastName ||
                  !email ||
                  !phone ||
                  (type === "trip" &&
                    !!selectedTrip?.requireTravelerId &&
                    !travelerIdFile)
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
                {type === "trip" && paymentMode === "partial"
                  ? `Pay deposit ${formatHotelPrice(amountDueNow)}`
                  : `Confirm and pay`}
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
