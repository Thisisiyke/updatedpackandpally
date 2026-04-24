"use client";

import { useRouter } from "next/navigation";
import { Luggage, ArrowRight, Plane, Leaf } from "lucide-react";
import { Flight } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatPrice } from "@/lib/flight-generator";

export function FlightCard({
  flight,
  searchParams,
}: {
  flight: Flight;
  searchParams: URLSearchParams;
}) {
  const router = useRouter();
  const first = flight.segments[0];
  const last = flight.segments[flight.segments.length - 1];

  const handleSelect = () => {
    const params = new URLSearchParams(searchParams);
    params.set("flightId", flight.id);
    router.push(`/flights/select?${params.toString()}`);
  };

  return (
    <div className="group rounded-2xl border bg-white p-5 transition-all hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Airline + Flight info */}
        <div className="flex flex-1 items-center gap-6">
          {/* Airline */}
          <div className="flex items-center gap-3 w-32 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Plane className="h-5 w-5 text-primary rotate-45" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{first.airline.name}</p>
              <p className="text-xs text-muted-foreground">
                {flight.segments.map((s) => s.flightNumber).join(" · ")}
              </p>
            </div>
          </div>

          {/* Times & route */}
          <div className="flex flex-1 items-center gap-4">
            <div className="text-right">
              <p className="text-xl font-bold">{first.departure.time}</p>
              <p className="text-xs text-muted-foreground">
                {first.departure.airport.code}
              </p>
            </div>

            <div className="flex-1">
              <div className="relative flex items-center">
                <div className="h-px flex-1 bg-border" />
                <div className="mx-2 text-center">
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(flight.totalDuration)}
                  </p>
                  <p className="text-xs font-medium">
                    {flight.stops === 0
                      ? "Direct"
                      : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>

            <div>
              <p className="text-xl font-bold">{last.arrival.time}</p>
              <p className="text-xs text-muted-foreground">
                {last.arrival.airport.code}
              </p>
            </div>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end lg:border-l lg:pl-6">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-2xl font-bold">{formatPrice(flight.price)}</p>
            <p className="text-xs text-muted-foreground">Round trip</p>
          </div>
          <Button onClick={handleSelect} className="gap-1.5">
            Select
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Tags row */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t">
        <Badge variant="secondary" className="gap-1 text-xs">
          <Luggage className="h-3 w-3" />
          {flight.baggage.checked > 0
            ? `${flight.baggage.checked} checked`
            : "Carry-on only"}
        </Badge>
        <Badge variant="secondary" className="text-xs capitalize">
          {flight.cabin}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {flight.fareType}
        </Badge>
        {flight.refundable && (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
            Refundable
          </Badge>
        )}
        <Badge variant="secondary" className="gap-1 text-xs">
          <Leaf className="h-3 w-3" />
          {flight.co2Kg} kg CO₂
        </Badge>
      </div>
    </div>
  );
}
