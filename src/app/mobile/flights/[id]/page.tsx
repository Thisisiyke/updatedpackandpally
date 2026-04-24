"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plane, Clock, Shield, Luggage, Leaf, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { generateFlights, formatDuration, formatPrice } from "@/lib/flight-generator";

export default function MobileFlightDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const departDate = searchParams.get("departDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const passengers = Number(searchParams.get("passengers") || "1");
  const cabin = (searchParams.get("cabin") || "economy") as any;

  const flights = useMemo(() => {
    return generateFlights({
      origin, destination, departDate,
      returnDate, passengers, cabin,
      tripType: "roundtrip",
    });
  }, [origin, destination, departDate, returnDate, passengers, cabin]);

  const flight = flights.find((f) => f.id === id);

  if (!flight) {
    return (
      <div className="flex flex-col h-full min-h-[844px]">
        <MobileHeader title="Flight" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <p className="font-semibold">Flight not found</p>
            <Button onClick={() => router.back()} className="mt-4">Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleBook = () => {
    const params = new URLSearchParams(searchParams);
    params.set("type", "flight");
    params.set("flightId", flight.id);
    router.push(`/mobile/checkout?${params.toString()}`);
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Flight details" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Airline card */}
        <div className="rounded-2xl bg-white p-4 border">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Plane className="h-5 w-5 text-primary rotate-45" />
            </div>
            <div>
              <p className="font-bold">{flight.segments[0].airline.name}</p>
              <p className="text-xs text-muted-foreground">
                {flight.segments.map((s) => s.flightNumber).join(" · ")}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {flight.segments.map((seg, i) => (
              <div key={i}>
                <div className="relative pl-6 border-l-2 border-dashed border-muted-foreground/30">
                  {/* Depart */}
                  <div className="relative mb-4">
                    <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20" />
                    <p className="text-xl font-bold">{seg.departure.time}</p>
                    <p className="text-xs font-medium">
                      {seg.departure.airport.city} ({seg.departure.airport.code})
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {seg.departure.airport.name}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="my-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(seg.duration)}
                  </div>

                  {/* Arrival */}
                  <div className="relative">
                    <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-muted-foreground/40 ring-4 ring-muted-foreground/10" />
                    <p className="text-xl font-bold">{seg.arrival.time}</p>
                    <p className="text-xs font-medium">
                      {seg.arrival.airport.city} ({seg.arrival.airport.code})
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {seg.arrival.airport.name}
                    </p>
                  </div>
                </div>

                {i < flight.segments.length - 1 && (
                  <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Layover in {seg.arrival.airport.city}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fare info */}
        <div className="rounded-2xl bg-white p-4 border">
          <h3 className="font-bold text-sm mb-3">What's included</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Luggage className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">Baggage</p>
                <p className="text-[10px] text-muted-foreground">
                  {flight.baggage.checked > 0
                    ? `${flight.baggage.checked} checked`
                    : "Carry-on only"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">
                  {flight.refundable ? "Refundable" : "Non-refundable"}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize">
                  {flight.cabin}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">Duration</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDuration(flight.totalDuration)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Leaf className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">CO₂ impact</p>
                <p className="text-[10px] text-muted-foreground">
                  {flight.co2Kg} kg / passenger
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="rounded-2xl bg-white p-4 border">
          <h3 className="font-bold text-sm mb-3">Price breakdown</h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Base fare × {passengers}
              </span>
              <span>{formatPrice(Math.round(flight.price * 0.8))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Taxes & fees</span>
              <span>{formatPrice(Math.round(flight.price * 0.2))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 bg-white border-t p-4 md:pb-8 flex items-center gap-3">
        <div>
          <p className="text-[10px] text-muted-foreground">Total</p>
          <p className="text-xl font-bold">{formatPrice(flight.price)}</p>
        </div>
        <Button onClick={handleBook} className="flex-1 h-12" size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
}
