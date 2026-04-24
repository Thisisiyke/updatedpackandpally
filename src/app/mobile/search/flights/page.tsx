"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plane,
  SlidersHorizontal,
  Luggage,
  Check,
  Sun,
  Sunrise,
  Sunset,
  Moon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import {
  generateFlights,
  formatDuration,
  formatPrice,
} from "@/lib/flight-generator";
import { cn } from "@/lib/utils";

type StopsFilter = "any" | "direct" | "1stop";

function timeOfDay(time: string): "morning" | "afternoon" | "evening" | "night" {
  const h = Number(time.split(":")[0]);
  if (h < 6) return "night";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function FlightSearchContent() {
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<"cheapest" | "fastest" | "best">("cheapest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const origin = searchParams.get("origin") || "New York";
  const destination = searchParams.get("destination") || "Paris";
  const departDate = searchParams.get("departDate") || "2026-05-15";
  const returnDate = searchParams.get("returnDate") || "2026-05-22";
  const passengers = Number(searchParams.get("passengers") || "1");
  const cabin = (searchParams.get("cabin") || "economy") as any;

  const flights = useMemo(
    () =>
      generateFlights({
        origin,
        destination,
        departDate,
        returnDate,
        passengers,
        cabin,
        tripType: "roundtrip",
      }),
    [origin, destination, departDate, returnDate, passengers, cabin]
  );

  // Derive filter bounds
  const { priceMin, priceMax, airlines } = useMemo(() => {
    const prices = flights.map((f) => f.price);
    const min = prices.length ? Math.min(...prices) : 0;
    const max = prices.length ? Math.max(...prices) : 1;
    const airlineSet = new Set(flights.map((f) => f.segments[0].airline.name));
    return {
      priceMin: min,
      priceMax: max,
      airlines: Array.from(airlineSet).sort(),
    };
  }, [flights]);

  // Filter state
  const [stops, setStops] = useState<StopsFilter>("any");
  const [priceMaxFilter, setPriceMaxFilter] = useState<number | null>(null);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [departTimes, setDepartTimes] = useState<string[]>([]);
  const [refundableOnly, setRefundableOnly] = useState(false);
  const [baggageOnly, setBaggageOnly] = useState(false);

  // Apply filters + sort
  const results = useMemo(() => {
    let list = [...flights];
    if (stops === "direct") list = list.filter((f) => f.stops === 0);
    else if (stops === "1stop") list = list.filter((f) => f.stops <= 1);
    if (priceMaxFilter !== null) list = list.filter((f) => f.price <= priceMaxFilter);
    if (selectedAirlines.length)
      list = list.filter((f) => selectedAirlines.includes(f.segments[0].airline.name));
    if (departTimes.length)
      list = list.filter((f) =>
        departTimes.includes(timeOfDay(f.segments[0].departure.time))
      );
    if (refundableOnly) list = list.filter((f) => f.refundable);
    if (baggageOnly) list = list.filter((f) => f.baggage.checked > 0);

    if (sortBy === "cheapest") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "fastest")
      list.sort((a, b) => a.totalDuration - b.totalDuration);
    else
      list.sort(
        (a, b) =>
          a.price / 100 + a.totalDuration / 60 - (b.price / 100 + b.totalDuration / 60)
      );
    return list.slice(0, 20);
  }, [
    flights,
    stops,
    priceMaxFilter,
    selectedAirlines,
    departTimes,
    refundableOnly,
    baggageOnly,
    sortBy,
  ]);

  const activeFilterCount =
    (stops !== "any" ? 1 : 0) +
    (priceMaxFilter !== null ? 1 : 0) +
    (selectedAirlines.length ? 1 : 0) +
    (departTimes.length ? 1 : 0) +
    (refundableOnly ? 1 : 0) +
    (baggageOnly ? 1 : 0);

  const clearAll = () => {
    setStops("any");
    setPriceMaxFilter(null);
    setSelectedAirlines([]);
    setDepartTimes([]);
    setRefundableOnly(false);
    setBaggageOnly(false);
  };

  const toggleAirline = (name: string) =>
    setSelectedAirlines((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );

  const toggleTime = (t: string) =>
    setDepartTimes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title={`${origin} → ${destination}`}
        action={
          <button
            onClick={() => setFiltersOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted/50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        }
      />

      {/* Date subline */}
      <div className="bg-white border-b px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>
          {new Date(departDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
          {" - "}
          {new Date(returnDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <span>
          {passengers} traveler · <span className="capitalize">{cabin}</span>
        </span>
      </div>

      {/* Sort */}
      <div className="bg-white px-4 py-2 border-b">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {[
            { value: "cheapest", label: "Cheapest" },
            { value: "fastest", label: "Fastest" },
            { value: "best", label: "Best" },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => setSortBy(s.value as any)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors",
                sortBy === s.value ? "bg-white shadow-sm" : "text-muted-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {results.length} {results.length === 1 ? "flight" : "flights"} found
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-primary"
            >
              Clear filters
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="py-16 text-center">
            <Plane className="h-10 w-10 text-muted-foreground mx-auto mb-2 rotate-45" />
            <p className="font-semibold text-sm">No flights match your filters</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={clearAll}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          results.map((flight) => {
            const first = flight.segments[0];
            const last = flight.segments[flight.segments.length - 1];
            return (
              <Link
                key={flight.id}
                href={`/mobile/flights/${flight.id}?${new URLSearchParams({
                  origin,
                  destination,
                  departDate,
                  returnDate,
                  passengers: String(passengers),
                  cabin,
                  tripType: "roundtrip",
                }).toString()}`}
                className="block rounded-2xl bg-white p-4 border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <Plane className="h-3.5 w-3.5 text-primary rotate-45" />
                    </div>
                    <span className="text-xs font-semibold">
                      {first.airline.name}
                    </span>
                  </div>
                  {flight.refundable && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                      Refundable
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold">{first.departure.time}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {first.departure.airport.code}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDuration(flight.totalDuration)}
                    </span>
                    <div className="w-full h-px bg-border my-1 relative">
                      <div className="absolute left-1/2 -translate-x-1/2 -top-1 h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-[10px] font-medium">
                      {flight.stops === 0
                        ? "Direct"
                        : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{last.arrival.time}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {last.arrival.airport.code}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Luggage className="h-3 w-3" />
                    {flight.baggage.checked > 0
                      ? `${flight.baggage.checked} checked`
                      : "Carry-on only"}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {formatPrice(flight.price)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">total</p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Filter bottom sheet */}
      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-11"
              onClick={clearAll}
            >
              Clear all
            </Button>
            <Button
              className="flex-1 h-11"
              onClick={() => setFiltersOpen(false)}
            >
              Show {results.length} flights
            </Button>
          </div>
        }
      >
        <div className="space-y-6 pb-2">
          {/* Stops */}
          <div>
            <h3 className="font-bold text-sm mb-2">Stops</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "any", label: "Any" },
                { value: "direct", label: "Direct" },
                { value: "1stop", label: "Max 1 stop" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStops(opt.value as StopsFilter)}
                  className={cn(
                    "rounded-xl border py-2 text-xs font-semibold transition-all",
                    stops === opt.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm">Max price</h3>
              <span className="text-xs font-semibold">
                {formatPrice(priceMaxFilter ?? priceMax)}
              </span>
            </div>
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              step={10}
              value={priceMaxFilter ?? priceMax}
              onChange={(e) => setPriceMaxFilter(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
              <span>{formatPrice(priceMin)}</span>
              <span>{formatPrice(priceMax)}</span>
            </div>
          </div>

          {/* Depart time */}
          <div>
            <h3 className="font-bold text-sm mb-2">Depart time</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: "morning", label: "Morning", icon: Sunrise, sub: "6a-12p" },
                { value: "afternoon", label: "Afternoon", icon: Sun, sub: "12p-6p" },
                { value: "evening", label: "Evening", icon: Sunset, sub: "6p-12a" },
                { value: "night", label: "Night", icon: Moon, sub: "12a-6a" },
              ].map((t) => {
                const active = departTimes.includes(t.value);
                return (
                  <button
                    key={t.value}
                    onClick={() => toggleTime(t.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border p-2 transition-all",
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    <t.icon className="h-4 w-4" />
                    <span className="text-[10px] font-semibold">{t.label}</span>
                    <span className="text-[9px] opacity-60">{t.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Airlines */}
          {airlines.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-2">Airlines</h3>
              <div className="space-y-1.5">
                {airlines.map((name) => {
                  const active = selectedAirlines.includes(name);
                  return (
                    <button
                      key={name}
                      onClick={() => toggleAirline(name)}
                      className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-xs font-medium">{name}</span>
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                          active
                            ? "border-primary bg-primary"
                            : "border-border"
                        )}
                      >
                        {active && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick toggles */}
          <div className="space-y-2">
            <label className="flex items-center justify-between rounded-xl border p-3 cursor-pointer">
              <div>
                <p className="text-sm font-semibold">Refundable only</p>
                <p className="text-[11px] text-muted-foreground">
                  Flexible cancellation
                </p>
              </div>
              <input
                type="checkbox"
                checked={refundableOnly}
                onChange={(e) => setRefundableOnly(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border p-3 cursor-pointer">
              <div>
                <p className="text-sm font-semibold">Includes checked bag</p>
                <p className="text-[11px] text-muted-foreground">
                  At least 1 checked bag
                </p>
              </div>
              <input
                type="checkbox"
                checked={baggageOnly}
                onChange={(e) => setBaggageOnly(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
            </label>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

export default function MobileFlightSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[844px] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <FlightSearchContent />
    </Suspense>
  );
}
