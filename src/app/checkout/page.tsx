"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Check,
  CreditCard,
  Lock,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Plane,
  Calendar,
  Clock,
  Compass,
  Minus,
  Plus,
  Users,
  Wallet,
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  generateFlights,
  formatDuration,
  formatPrice,
} from "@/lib/inventory/flights";
import {
  generateHotels,
  formatHotelPrice,
  calculateNights,
} from "@/lib/inventory/hotels";
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
import type { Trip } from "@/types";
import { joinTripGroupChat } from "@/hooks/use-conversations";
import { cn } from "@/lib/utils";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { isPackPallyMember } from "@/lib/member-auth";
import { wanderlyBookingAmounts } from "@/lib/wanderly-booking-math";
import { buildBookTripBody } from "@/lib/wanderly-book-trip";
import {
  WanderlyTripStripeRoot,
  WanderlyPaymentSection,
  WanderlyConfirmPaymentButton,
  wanderlyStripePromise,
} from "@/components/checkout/wanderly-trip-stripe";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // "flight" | "hotel" | "trip"

  // Flight params
  const flightId = searchParams.get("flightId");
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const departDate = searchParams.get("departDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const passengers = Number(searchParams.get("passengers") || "1");
  const cabin = (searchParams.get("cabin") || "economy") as any;
  const tripType = searchParams.get("tripType") || "roundtrip";

  // Hotel params
  const hotelId = searchParams.get("hotelId");
  const roomId = searchParams.get("roomId");
  const location = searchParams.get("location") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = Number(searchParams.get("guests") || "2");
  const rooms = Number(searchParams.get("rooms") || "1");

  // Trip params
  const tripId = searchParams.get("tripId");
  const initialTravelers = Math.max(1, Number(searchParams.get("travelers") || "1"));

  const { user: packUser, loading: authLoading } = usePackPallyAuth();
  const [apiTrip, setApiTrip] = useState<Trip | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [piCustomerId, setPiCustomerId] = useState<string>("");
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (!tripId) return;
    const seed = trips.find((t) => t.id === tripId);
    if (seed) {
      setApiTrip(seed);
      return;
    }
    let c = false;
    fetch(`/api/trips/${encodeURIComponent(tripId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!c && d.trip) setApiTrip(d.trip);
      })
      .catch(() => {});
    return () => {
      c = true;
    };
  }, [tripId]);

  const flights = useMemo(() => {
    if (type !== "flight") return [];
    return generateFlights({
      origin, destination, departDate,
      returnDate: returnDate || undefined,
      passengers, cabin, tripType: tripType as "oneway" | "roundtrip",
    });
  }, [type, origin, destination, departDate, returnDate, passengers, cabin, tripType]);

  const hotels = useMemo(() => {
    if (type !== "hotel") return [];
    return generateHotels({ location, checkIn, checkOut, guests, rooms });
  }, [type, location, checkIn, checkOut, guests, rooms]);

  const selectedFlight = type === "flight" ? flights.find((f) => f.id === flightId) : null;
  const selectedHotel = type === "hotel" ? hotels.find((h) => h.id === hotelId) : null;
  const selectedRoom = selectedHotel?.roomTypes.find((r) => r.id === roomId) || selectedHotel?.roomTypes[0];
  const selectedTrip =
    type === "trip"
      ? apiTrip || trips.find((t) => t.id === tripId) || null
      : null;

  const nights = type === "hotel" ? calculateNights(checkIn, checkOut) : 0;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [processing, setProcessing] = useState(false);

  // Step 1: Traveler/Guest details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
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

  // Trip-specific state
  const spotsAvailable = selectedTrip
    ? Math.max(1, selectedTrip.maxGroupSize - selectedTrip.currentBookings)
    : 1;
  const [tripTravelers, setTripTravelers] = useState(
    Math.min(initialTravelers, selectedTrip ? spotsAvailable : initialTravelers)
  );
  const [paymentMode, setPaymentMode] = useState<"full" | "partial">("full");

  const wAmt =
    selectedTrip?.wanderly &&
    wanderlyBookingAmounts(
      selectedTrip.price,
      selectedTrip.wanderly.tripTax,
      tripTravelers
    );

  const useWanderlyStripe =
    type === "trip" &&
    Boolean(selectedTrip?.wanderly) &&
    isPackPallyMember(packUser) &&
    Boolean(wanderlyStripePromise);

  useEffect(() => {
    if (step !== 3) {
      setClientSecret(null);
    }
  }, [step]);

  useEffect(() => {
    setClientSecret(null);
  }, [paymentMode]);

  useEffect(() => {
    if (step !== 3 || !useWanderlyStripe || !wAmt || !firstName || !email) {
      return;
    }
    const amount =
      paymentMode === "partial" ? wAmt.GrandpartialAmt : wAmt.GrandFullAmt;
    let cancelled = false;
    fetch("/api/bookings/payment-intent", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name: `${firstName} ${lastName}`.trim(),
        amount,
        currency: "usd",
        tripId: selectedTrip?.wanderly?._id,
        tripTimestamp: selectedTrip?.wanderly?.timestamp,
        userId: packUser?.id || "",
        paymentMode,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.clientSecret) {
          setClientSecret(d.clientSecret);
          if (d.customer) setPiCustomerId(d.customer);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [
    step,
    useWanderlyStripe,
    wAmt,
    paymentMode,
    firstName,
    lastName,
    email,
    selectedTrip?.wanderly?._id,
    selectedTrip?.wanderly?.timestamp,
  ]);

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

  // Step 2: Payment
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingZip, setBillingZip] = useState("");

  if (!selectedFlight && !selectedHotel && !selectedTrip) {
    return (
      <Container className="py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Booking not found</h1>
          <p className="text-muted-foreground mt-2">
            Your selection has expired. Please start a new search.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </Container>
    );
  }

  if (authLoading) {
    return (
      <Container className="py-24 text-center text-muted-foreground text-sm">
        Loading…
      </Container>
    );
  }

  if (!isPackPallyMember(packUser)) {
    const nextPath =
      searchParams.toString().length > 0
        ? `/checkout?${searchParams.toString()}`
        : "/checkout";
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold">Sign in to complete your booking</h1>
          <p className="text-muted-foreground mt-2">
            You can browse flights, hotels, and trips without an account. Sign in
            or create one to pay and confirm.
          </p>
          <Button asChild className="mt-6">
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>
              Sign in
            </Link>
          </Button>
        </div>
      </Container>
    );
  }

  // Calculate totals
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

  const installmentsAllowed =
    type === "trip" &&
    !!selectedTrip?.partialPayment?.enabled &&
    !!selectedTrip &&
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

  // Wanderly Stripe trips use backend pricing math; others use installments or the platform deposit model.
  const wanderlyPartialDueNow = wAmt ? wAmt.GrandpartialAmt : null;
  const wanderlyPartialDueLater = wAmt
    ? Number((wAmt.GrandFullAmt - wAmt.GrandpartialAmt).toFixed(2))
    : null;

  const amountDueNow =
    type === "trip" && paymentMode === "partial"
      ? useWanderlyStripe && wanderlyPartialDueNow !== null
        ? wanderlyPartialDueNow
        : installmentSchedule
          ? installmentSchedule[0].amount
          : depositAmount(total)
      : useWanderlyStripe && wAmt
        ? wAmt.GrandFullAmt
        : total;
  const amountDueLater =
    type === "trip" && paymentMode === "partial"
      ? useWanderlyStripe && wanderlyPartialDueLater !== null
        ? wanderlyPartialDueLater
        : installmentSchedule
          ? installmentSchedule[1].amount + installmentSchedule[2].amount
          : remainingAmount(total)
      : 0;

  const depositPctLabel = useWanderlyStripe ? 20 : Math.round(DEPOSIT_PERCENT * 100);
  const remainingDueCopy = useWanderlyStripe
    ? "1 week before departure"
    : "30 days before departure";

  const handleStep1Next = () => {
    if (!firstName || !lastName || !email || !phone) return;
    if (type === "trip" && selectedTrip?.wanderly && !isPackPallyMember(packUser)) {
      const nextPath =
        searchParams.toString().length > 0
          ? `/checkout?${searchParams.toString()}`
          : "/checkout";
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }
    setStep(2);
  };

  const finalizeWanderlyBooking = async (paymentIntentId: string) => {
    if (!selectedTrip?.wanderly || !isPackPallyMember(packUser)) return;
    const member = packUser!;
    const body = buildBookTripBody({
      trip: selectedTrip,
      travelers: tripTravelers,
      paymentMode,
      firstName,
      lastName,
      email,
      mobile: phone,
      userId: member.id,
      userProfileImg: member.image,
      paymentIntentId,
      customerId: piCustomerId,
    });
    const res = await fetch("/api/bookings/complete", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.status !== "success") {
      throw new Error(data.message || "Booking failed");
    }
    const bid = data.booking?._id || `PP${Date.now().toString(36).toUpperCase()}`;
    try {
      sessionStorage.setItem(
        `pp_confirm_${bid}`,
        JSON.stringify({ booking: data.booking, trip: selectedTrip })
      );
    } catch {
      /* ignore */
    }
    router.push(`/bookings/${encodeURIComponent(bid)}/confirmed`);
  };

  const handleConfirm = async () => {
    if (useWanderlyStripe && clientSecret) {
      return;
    }
    if (type === "trip" && selectedTrip?.wanderly) {
      if (!wanderlyStripePromise) {
        setBookingError("Stripe is not configured (missing publishable key).");
        return;
      }
      if (!isPackPallyMember(packUser)) {
        const nextPath =
          searchParams.toString().length > 0
            ? `/checkout?${searchParams.toString()}`
            : "/checkout";
        router.push(`/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }
      setBookingError("Complete payment with the card form above.");
      return;
    }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
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
      specialRequests,
    };

    try {
      const existing = JSON.parse(
        localStorage.getItem("packpally_bookings") || "[]"
      );
      existing.push(bookingData);
      localStorage.setItem("packpally_bookings", JSON.stringify(existing));
    } catch {
      /* ignore */
    }

    if (selectedTrip) {
      const tripHost = hosts.find((h) => h.id === selectedTrip.hostId);
      joinTripGroupChat(selectedTrip, tripHost);
    }

    router.push(`/bookings/${bookingId}/confirmed`);
    setProcessing(false);
  };

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    const clean = value.replace(/\D/g, "");
    if (clean.length >= 2) {
      return `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
    }
    return clean;
  };

  return (
    <section className="bg-muted/20 pb-16 min-h-[calc(100vh-4rem)]">
      <Container className="py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 gap-1.5 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-2 sm:gap-4 max-w-2xl">
            {[
              { num: 1, label: "Details" },
              { num: 2, label: "Payment" },
              { num: 3, label: "Review" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold shrink-0",
                      step >= s.num
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium hidden sm:inline",
                      step >= s.num ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-colors",
                      step > s.num ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left — Form steps */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="rounded-2xl border bg-white p-6">
                <h1 className="text-2xl font-bold mb-1">
                  {type === "flight"
                    ? "Traveler details"
                    : type === "trip"
                    ? "Traveler details"
                    : "Guest details"}
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Enter the primary{" "}
                  {type === "flight" || type === "trip" ? "traveler" : "guest"}
                  &apos;s information
                </p>

                {type === "trip" && selectedTrip && tripPricing && (
                  <div className="mb-6 rounded-xl bg-primary/5 border border-primary/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-primary" />
                          How many travelers?
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {spotsAvailable} spot{spotsAvailable !== 1 ? "s" : ""} left
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() =>
                            setTripTravelers(Math.max(1, tripTravelers - 1))
                          }
                          disabled={tripTravelers <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-bold text-lg">
                          {tripTravelers}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          onClick={() =>
                            setTripTravelers(
                              Math.min(spotsAvailable, tripTravelers + 1)
                            )
                          }
                          disabled={tripTravelers >= spotsAvailable}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          ${tripPricing.rate.toLocaleString()} × {tripTravelers}{" "}
                          traveler{tripTravelers !== 1 ? "s" : ""}
                        </span>
                        <span>
                          ${tripPricing.subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>
                          Tax ({formatRatePercent(breakdown.taxRate)})
                        </span>
                        <span>${breakdown.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>
                          Platform fee (
                          {formatRatePercent(breakdown.platformFeeRate)})
                        </span>
                        <span>${breakdown.platformFee.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t font-bold">
                        <span>Total</span>
                        <span>${breakdown.total.toLocaleString()}</span>
                      </div>
                    </div>
                    {selectedTrip.priceTiers && (
                      <p className="mt-1 text-xs text-primary">
                        Group rate applied
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>First name</Label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last name</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                {type === "hotel" && (
                  <div className="mt-4 space-y-2">
                    <Label>Special requests (optional)</Label>
                    <Input
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g., Late check-in, extra bed, accessible room"
                    />
                  </div>
                )}

                {/* Government ID — when host requires it */}
                {type === "trip" && selectedTrip?.requireTravelerId && (
                  <div className="mt-6 pt-5 border-t space-y-3">
                    <div>
                      <Label>
                        Government ID{" "}
                        <span className="text-red-600">*</span>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your host needs to verify each traveler. Upload a
                        passport, driver&apos;s license, or national ID.
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
                          <Check className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {travelerIdFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(travelerIdFile.sizeBytes / 1024).toFixed(0)} KB ·
                            Encrypted in transit
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setTravelerIdFile(null)}
                          className="shrink-0 text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => idInputRef.current?.click()}
                        className="flex h-24 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed text-sm text-muted-foreground gap-1 hover:border-primary/40 hover:text-foreground transition-colors"
                      >
                        Click to upload ID
                        <span className="text-xs">PDF or photo · up to 8 MB</span>
                      </button>
                    )}
                    {idError && (
                      <p className="text-xs text-red-600">{idError}</p>
                    )}
                  </div>
                )}

                {/* Social media link — when host requests it */}
                {type === "trip" && selectedTrip?.requestSocialMedia && (
                  <div className="mt-6 pt-5 border-t space-y-2">
                    <Label>
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
                    />
                    <p className="text-xs text-muted-foreground">
                      Helps your trip group recognize each other before the
                      trip.
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button
                    size="lg"
                    onClick={handleStep1Next}
                    disabled={
                      !firstName ||
                      !lastName ||
                      !email ||
                      !phone ||
                      (type === "trip" &&
                        !!selectedTrip?.requireTravelerId &&
                        !travelerIdFile)
                    }
                  >
                    Continue to payment
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="rounded-2xl border bg-white p-6">
                <h1 className="text-2xl font-bold mb-1">Payment details</h1>
                <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  All transactions are secure and encrypted
                </p>

                {type === "trip" && selectedTrip?.wanderly && !wanderlyStripePromise && (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    Card payments need{" "}
                    <code className="text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>{" "}
                    in your environment.
                  </div>
                )}

                {type === "trip" && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <h3 className="font-semibold flex items-center gap-1.5">
                        <Wallet className="h-4 w-4 text-primary" />
                        Want to pay partially?
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {installmentsBlocked
                          ? "Partial payment isn't available for this trip — pay in full to confirm your spot."
                          : installmentsAllowed
                          ? "Split the cost into 3 equal installments scheduled before the trip starts."
                          : `Place a ${Math.round(DEPOSIT_PERCENT * 100)}% deposit now and pay the rest 30 days before departure.`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMode("full")}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-all",
                          paymentMode === "full"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-muted hover:border-primary/40"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">
                            No, pay in full
                          </span>
                          {paymentMode === "full" && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ${total.toLocaleString()} charged today
                        </p>
                      </button>
                      {useWanderlyStripe ? (
                      <button
                        type="button"
                        onClick={() => setPaymentMode("partial")}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-all",
                          paymentMode === "partial"
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-muted hover:border-primary/40"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">
                            Pay {depositPctLabel}% deposit
                          </span>
                          {paymentMode === "partial" && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-xl font-bold">
                          ${amountDueNow.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ${(wanderlyPartialDueLater ?? remainingAmount(total)).toLocaleString()} due{" "}
                          {remainingDueCopy}
                        </p>
                      </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            !installmentsBlocked && setPaymentMode("partial")
                          }
                          disabled={installmentsBlocked}
                          className={cn(
                            "rounded-xl border p-4 text-left transition-all",
                            installmentsBlocked
                              ? "opacity-50 cursor-not-allowed border-muted"
                              : paymentMode === "partial"
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-muted hover:border-primary/40"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">
                              Yes, split it
                            </span>
                            {paymentMode === "partial" &&
                              !installmentsBlocked && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {installmentsAllowed && installmentSchedule
                              ? "3 installments"
                              : `${Math.round(DEPOSIT_PERCENT * 100)}% deposit`}
                          </p>
                        </button>
                      )}
                    </div>

                    {paymentMode === "full" && (
                      <div className="rounded-xl bg-muted/30 border p-3 text-sm">
                        <p className="font-semibold">
                          ${total.toLocaleString()} today — one charge,
                          you&apos;re all set.
                        </p>
                      </div>
                    )}

                    {installmentsBlocked && selectedTrip && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
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

                    {paymentMode === "partial" &&
                      installmentsAllowed &&
                      installmentSchedule && (
                        <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                              Your installment schedule
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                              3 equal payments
                            </span>
                          </div>
                          {installmentSchedule.map((s) => (
                            <div
                              key={s.index}
                              className="flex items-center justify-between gap-2 rounded-lg bg-white border px-3 py-2.5"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary shrink-0">
                                  {s.index}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold truncate">
                                    {s.label}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    Due {formatInstallmentDue(s.dueAt)}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm font-bold">
                                ${s.amount.toLocaleString()}
                              </p>
                            </div>
                          ))}
                          <div className="mt-1 flex items-center justify-between rounded-lg bg-primary/5 border border-primary/15 px-3 py-2">
                            <span className="text-xs font-semibold">
                              Due today
                            </span>
                            <span className="text-base font-bold text-primary">
                              ${installmentSchedule[0].amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}

                    {paymentMode === "partial" &&
                      !installmentsAllowed &&
                      !installmentsBlocked && (
                        <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                            Deposit plan
                          </p>
                          <div className="flex items-center justify-between rounded-lg bg-white border px-3 py-2.5">
                            <div>
                              <p className="text-sm font-semibold">Today</p>
                              <p className="text-[11px] text-muted-foreground">
                                {Math.round(DEPOSIT_PERCENT * 100)}% deposit
                              </p>
                            </div>
                            <p className="text-sm font-bold">
                              ${depositAmount(total).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-white border px-3 py-2.5">
                            <div>
                              <p className="text-sm font-semibold">
                                30 days before departure
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                Remaining balance
                              </p>
                            </div>
                            <p className="text-sm font-bold">
                              ${remainingAmount(total).toLocaleString()}
                            </p>
                          </div>
                          <div className="mt-1 flex items-center justify-between rounded-lg bg-primary/5 border border-primary/15 px-3 py-2">
                            <span className="text-xs font-semibold">
                              Due today
                            </span>
                            <span className="text-base font-bold text-primary">
                              ${depositAmount(total).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {!useWanderlyStripe ? (
                  <>
                {/* Card preview */}
                <div className="mb-6 relative h-48 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <CreditCard className="h-8 w-8 text-white/70" />
                      <span className="text-sm font-semibold tracking-wider">
                        VISA
                      </span>
                    </div>
                    <div>
                      <p className="text-lg tracking-widest font-mono">
                        {cardNumber || "•••• •••• •••• ••••"}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs opacity-60">CARD HOLDER</p>
                          <p className="text-sm font-medium uppercase">
                            {cardName || "YOUR NAME"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs opacity-60">EXPIRES</p>
                          <p className="text-sm font-medium">
                            {expiry || "MM/YY"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Card number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={cardNumber}
                        onChange={(e) =>
                          setCardNumber(formatCardNumber(e.target.value))
                        }
                        placeholder="1234 5678 9012 3456"
                        className="pl-9 font-mono"
                        maxLength={19}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cardholder name</Label>
                    <Input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="As shown on card"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry date</Label>
                      <Input
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CVC</Label>
                      <Input
                        value={cvc}
                        onChange={(e) =>
                          setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div>
                    <h3 className="font-semibold mb-3">Billing address</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Street address</Label>
                        <Input
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input
                            value={billingCity}
                            onChange={(e) => setBillingCity(e.target.value)}
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>ZIP / Postal</Label>
                          <Input
                            value={billingZip}
                            onChange={(e) => setBillingZip(e.target.value)}
                            placeholder="12345"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mb-6">
                    On the next step you&apos;ll enter card details in a secure Stripe
                    form. Your card is not stored on our servers.
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back to details
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => setStep(3)}
                    disabled={
                      useWanderlyStripe
                        ? !wanderlyStripePromise
                        : !cardNumber ||
                          !cardName ||
                          !expiry ||
                          !cvc ||
                          !billingAddress ||
                          !billingCity
                    }
                  >
                    Review booking
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="rounded-2xl border bg-white p-6">
                <h1 className="text-2xl font-bold mb-1">Review your booking</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Double-check everything before confirming
                </p>

                {/* Booking summary */}
                {selectedFlight && (
                  <div className="rounded-xl border p-4 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Plane className="h-5 w-5 text-primary rotate-45" />
                      <h3 className="font-bold">
                        {origin} → {destination}
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Depart</p>
                        <p className="font-medium">
                          {new Date(departDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      {returnDate && (
                        <div>
                          <p className="text-xs text-muted-foreground">Return</p>
                          <p className="font-medium">
                            {new Date(returnDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Passengers</p>
                        <p className="font-medium">{passengers}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Cabin</p>
                        <p className="font-medium capitalize">{cabin}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedHotel && selectedRoom && (
                  <div className="rounded-xl border p-4 mb-4">
                    <div className="flex gap-3 mb-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg shrink-0">
                        <Image
                          src={selectedHotel.coverImage}
                          alt={selectedHotel.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{selectedHotel.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {selectedRoom.name}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Check-in</p>
                        <p className="font-medium">
                          {new Date(checkIn).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Check-out</p>
                        <p className="font-medium">
                          {new Date(checkOut).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Guests</p>
                        <p className="font-medium">{guests}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Nights</p>
                        <p className="font-medium">{nights}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTrip && tripPricing && (
                  <div className="rounded-xl border p-4 mb-4">
                    <div className="flex gap-3 mb-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg shrink-0">
                        <Image
                          src={selectedTrip.coverImage}
                          alt={selectedTrip.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{selectedTrip.title}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {selectedTrip.destination}, {selectedTrip.country}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Dates</p>
                        <p className="font-medium">
                          {new Date(selectedTrip.startDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}{" "}
                          —{" "}
                          {new Date(selectedTrip.endDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-medium">
                          {selectedTrip.durationDays} days
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Travelers</p>
                        <p className="font-medium">{tripTravelers}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Per person</p>
                        <p className="font-medium">
                          ${tripPricing.rate.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {paymentMode === "partial" && (
                      <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                        <p className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                          <Wallet className="h-3.5 w-3.5" />
                          Partial payment plan — {depositPctLabel}% deposit
                        </p>
                        <div className="mt-2 space-y-1 text-xs text-amber-900/80">
                          <div className="flex items-center justify-between">
                            <span>Deposit due today</span>
                            <span className="font-semibold">
                              ${amountDueNow.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Remaining ({remainingDueCopy})</span>
                            <span className="font-semibold">
                              ${amountDueLater.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Contact info */}
                <div className="rounded-xl border p-4 mb-4">
                  <h3 className="font-bold mb-3">Contact</h3>
                  <div className="space-y-1 text-sm">
                    <p>
                      {firstName} {lastName}
                    </p>
                    <p className="text-muted-foreground">{email}</p>
                    <p className="text-muted-foreground">{phone}</p>
                  </div>
                </div>

                {/* Payment method */}
                {useWanderlyStripe ? (
                  <div className="rounded-xl border p-4 mb-6 space-y-3">
                    <h3 className="font-bold">Secure payment</h3>
                    {bookingError ? (
                      <p className="text-sm text-red-600">{bookingError}</p>
                    ) : null}
                    {!wanderlyStripePromise ? (
                      <p className="text-sm text-muted-foreground">
                        Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable payments.
                      </p>
                    ) : !clientSecret ? (
                      <p className="text-sm text-muted-foreground">
                        Preparing secure payment…
                      </p>
                    ) : (
                      <WanderlyTripStripeRoot clientSecret={clientSecret}>
                        <WanderlyPaymentSection />
                        <div className="mt-4">
                          <WanderlyConfirmPaymentButton
                            label={
                              type === "trip" && paymentMode === "partial"
                                ? `Pay deposit ${formatHotelPrice(amountDueNow)}`
                                : `Pay ${formatHotelPrice(amountDueNow)}`
                            }
                            disabled={processing}
                            onPaid={async (paymentIntentId) => {
                              setBookingError("");
                              setProcessing(true);
                              try {
                                await finalizeWanderlyBooking(paymentIntentId);
                              } catch (e: unknown) {
                                setBookingError(
                                  e instanceof Error ? e.message : "Booking failed"
                                );
                              } finally {
                                setProcessing(false);
                              }
                            }}
                          />
                        </div>
                      </WanderlyTripStripeRoot>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border p-4 mb-6">
                    <h3 className="font-bold mb-3">Payment method</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4" />
                      <span>
                        •••• •••• ••••{" "}
                        {cardNumber.replace(/\s/g, "").slice(-4) || "••••"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Terms */}
                <div className="rounded-xl bg-muted/50 p-4 text-xs text-muted-foreground mb-6">
                  <p>
                    By confirming you agree to our Terms of Service, Privacy Policy,
                    and the provider&apos;s cancellation policy.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    disabled={processing}
                  >
                    Back to payment
                  </Button>
                  {!(useWanderlyStripe && clientSecret && wanderlyStripePromise) ? (
                    <Button
                      size="lg"
                      onClick={handleConfirm}
                      disabled={processing}
                      className="sm:min-w-[200px]"
                    >
                      {processing ? (
                        "Processing..."
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          {type === "trip" && paymentMode === "partial"
                            ? `Pay deposit ${formatHotelPrice(amountDueNow)}`
                            : `Confirm and pay ${formatHotelPrice(total)}`}
                        </>
                      )}
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground sm:text-right sm:max-w-xs self-center">
                      Use the Pay button above to complete your card payment.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right — Summary */}
          <div>
            <div className="sticky top-24 rounded-2xl border bg-white p-6 shadow-sm">
              <h3 className="font-bold mb-4">Order summary</h3>

              {selectedFlight && (
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="h-4 w-4 text-primary rotate-45" />
                    <p className="text-sm font-semibold">
                      {origin} → {destination}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedFlight.segments[0].airline.name} ·{" "}
                    {formatDuration(selectedFlight.totalDuration)} ·{" "}
                    {selectedFlight.stops === 0
                      ? "Direct"
                      : `${selectedFlight.stops} stop${selectedFlight.stops > 1 ? "s" : ""}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {cabin} · {passengers}{" "}
                    {passengers === 1 ? "passenger" : "passengers"}
                  </p>
                </div>
              )}

              {selectedHotel && selectedRoom && (
                <div className="mb-4 pb-4 border-b">
                  <div className="flex gap-3 mb-2">
                    <div className="relative h-14 w-14 overflow-hidden rounded-lg shrink-0">
                      <Image
                        src={selectedHotel.coverImage}
                        alt={selectedHotel.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {selectedHotel.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedRoom.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {nights} {nights === 1 ? "night" : "nights"} · {guests}{" "}
                    {guests === 1 ? "guest" : "guests"}
                  </p>
                </div>
              )}

              {selectedTrip && tripPricing && (
                <div className="mb-4 pb-4 border-b">
                  <div className="flex gap-3 mb-2">
                    <div className="relative h-14 w-14 overflow-hidden rounded-lg shrink-0">
                      <Image
                        src={selectedTrip.coverImage}
                        alt={selectedTrip.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {selectedTrip.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedTrip.destination}, {selectedTrip.country}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedTrip.durationDays} days · {tripTravelers}{" "}
                    traveler{tripTravelers !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              <div className="space-y-2 text-sm">
                {selectedTrip && tripPricing ? (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      ${tripPricing.rate.toLocaleString()} × {tripTravelers}
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
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  {formatHotelPrice(total)}
                </span>
              </div>

              {type === "trip" && paymentMode === "partial" && (
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-900">Due today</span>
                    <span className="font-bold text-amber-900">
                      {formatHotelPrice(amountDueNow)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-amber-900/80">
                    <span>Due later</span>
                    <span>{formatHotelPrice(amountDueLater)}</span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Secure & encrypted checkout
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
