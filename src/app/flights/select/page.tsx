"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  Plane,
  Clock,
  Luggage,
  Leaf,
  Shield,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { generateFlights, formatDuration, formatPrice } from "@/lib/flight-generator";
import { useRequireMember } from "@/hooks/use-require-member";
import { FEATURE_FLAGS, PROVIDER_NAMES } from "@/lib/constants";
import { ProviderComingSoon } from "@/components/shared/provider-coming-soon";

function SelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ensureMember, loginDialog } = useRequireMember();
  const flightId = searchParams.get("flightId");
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const departDate = searchParams.get("departDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const passengers = Number(searchParams.get("passengers") || "1");
  const cabin = (searchParams.get("cabin") || "economy") as any;
  const tripType = searchParams.get("tripType") || "roundtrip";

  const flights = useMemo(() => {
    return generateFlights({
      origin,
      destination,
      departDate,
      returnDate: returnDate || undefined,
      passengers,
      cabin,
      tripType: tripType as "oneway" | "roundtrip",
    });
  }, [origin, destination, departDate, returnDate, passengers, cabin, tripType]);

  const flight = flights.find((f) => f.id === flightId);

  if (!flight) {
    return (
      <Container className="py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Flight not found</h1>
          <p className="text-muted-foreground mt-2">
            This flight is no longer available.
          </p>
          <Button asChild className="mt-6">
            <Link href="/flights">Back to search</Link>
          </Button>
        </div>
      </Container>
    );
  }

  const handleContinue = () => {
    ensureMember(() => {
      const params = new URLSearchParams(searchParams);
      params.set("type", "flight");
      router.push(`/checkout?${params.toString()}`);
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="pb-16">
      {loginDialog}
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <Container className="py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/flights" className="hover:text-foreground">
              Flights
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">
              {origin} → {destination}
            </span>
          </nav>
        </Container>
      </div>

      <Container className="mt-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 gap-1.5 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to results
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left — Flight details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">
                {origin} → {destination}
              </h1>
              <p className="text-muted-foreground mt-1">
                {formatDate(departDate)}
                {returnDate && ` - ${formatDate(returnDate)}`}
              </p>
            </div>

            {/* Segments */}
            <div className="rounded-2xl border bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Flight details</h2>
                <Badge className="capitalize">{flight.cabin}</Badge>
              </div>

              <div className="space-y-6">
                {flight.segments.map((seg, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Plane className="h-5 w-5 text-primary rotate-45" />
                      </div>
                      <div>
                        <p className="font-semibold">{seg.airline.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {seg.flightNumber} · {seg.aircraft}
                        </p>
                      </div>
                    </div>

                    <div className="ml-12 relative pl-6 border-l-2 border-dashed border-muted-foreground/30">
                      {/* Departure */}
                      <div className="relative mb-6">
                        <div className="absolute -left-[30px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
                        <p className="text-xl font-bold">{seg.departure.time}</p>
                        <p className="text-sm font-medium">
                          {seg.departure.airport.city} ({seg.departure.airport.code})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {seg.departure.airport.name}
                        </p>
                      </div>

                      {/* Duration */}
                      <div className="my-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(seg.duration)} flight
                      </div>

                      {/* Arrival */}
                      <div className="relative">
                        <div className="absolute -left-[30px] top-1.5 h-3 w-3 rounded-full bg-muted-foreground/40 ring-4 ring-muted-foreground/10" />
                        <p className="text-xl font-bold">{seg.arrival.time}</p>
                        <p className="text-sm font-medium">
                          {seg.arrival.airport.city} ({seg.arrival.airport.code})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {seg.arrival.airport.name}
                        </p>
                      </div>
                    </div>

                    {i < flight.segments.length - 1 && (
                      <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Layover in {seg.arrival.airport.city}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fare info */}
            <div className="rounded-2xl border bg-white p-6">
              <h2 className="text-lg font-bold mb-4">What&apos;s included</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Luggage className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Baggage</p>
                    <p className="text-xs text-muted-foreground">
                      {flight.baggage.carryOn && "Carry-on included. "}
                      {flight.baggage.checked > 0
                        ? `${flight.baggage.checked} checked bag${flight.baggage.checked > 1 ? "s" : ""}`
                        : "No checked bags"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">
                      {flight.refundable ? "Refundable" : "Non-refundable"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {flight.refundable
                        ? "Cancel for full refund anytime"
                        : "Changes subject to airline fees"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Leaf className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Environmental impact</p>
                    <p className="text-xs text-muted-foreground">
                      {flight.co2Kg} kg CO₂ per passenger
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Total duration</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(flight.totalDuration)} · {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Pricing card */}
          <div>
            <div className="sticky top-24 rounded-2xl border bg-white p-6 shadow-lg">
              <h2 className="text-lg font-bold mb-4">Price details</h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Base fare × {passengers}
                  </span>
                  <span>{formatPrice(flight.price * 0.8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Taxes & fees</span>
                  <span>{formatPrice(flight.price * 0.2)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  {formatPrice(flight.price)}
                </span>
              </div>

              <p className="mt-1 text-xs text-muted-foreground text-right">
                for {passengers} {passengers === 1 ? "passenger" : "passengers"}
              </p>

              <Button
                className="mt-6 w-full h-12 text-base"
                size="lg"
                onClick={handleContinue}
              >
                Continue to checkout
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Secure booking · No hidden fees
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function FlightSelectPage() {
  if (!FEATURE_FLAGS.publicFlightSearch) {
    return (
      <ProviderComingSoon
        title="Flight booking — coming soon"
        description="Once the flight integration is live, you'll review fares and ancillaries here before checking out."
        provider={PROVIDER_NAMES.flights}
        ctaHref="/browse-trips"
        ctaLabel="Browse group trips"
      />
    );
  }
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading...</div>}>
      <SelectContent />
    </Suspense>
  );
}
