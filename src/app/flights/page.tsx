"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plane, SlidersHorizontal, X, Clock, DollarSign, Users, Award } from "lucide-react";
import { Container } from "@/components/shared/container";
import { FlightSearchForm } from "@/components/flights/flight-search-form";
import { FlightCard } from "@/components/flights/flight-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { generateFlights, formatPrice } from "@/lib/flight-generator";
import { cn } from "@/lib/utils";

function FlightsContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin") || "";
  const destination = searchParams.get("destination") || "";
  const departDate = searchParams.get("departDate") || "";
  const returnDate = searchParams.get("returnDate") || "";
  const passengers = Number(searchParams.get("passengers") || "1");
  const cabin = (searchParams.get("cabin") || "economy") as any;
  const tripType = searchParams.get("tripType") || "roundtrip";

  const hasSearched = Boolean(origin && destination && departDate);

  const allFlights = useMemo(() => {
    if (!hasSearched) return [];
    return generateFlights({
      origin,
      destination,
      departDate,
      returnDate: returnDate || undefined,
      passengers,
      cabin,
      tripType: tripType as "oneway" | "roundtrip",
    });
  }, [origin, destination, departDate, returnDate, passengers, cabin, tripType, hasSearched]);

  const maxPrice = allFlights.length > 0 ? Math.max(...allFlights.map((f) => f.price)) : 5000;
  const minPrice = allFlights.length > 0 ? Math.min(...allFlights.map((f) => f.price)) : 0;

  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [stopsFilter, setStopsFilter] = useState<number[]>([]);
  const [airlineFilter, setAirlineFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("cheapest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const availableAirlines = Array.from(
    new Set(allFlights.map((f) => f.segments[0].airline.name))
  );

  const filteredFlights = useMemo(() => {
    let results = allFlights.filter((f) => {
      if (f.price < priceRange[0] || f.price > priceRange[1]) return false;
      if (stopsFilter.length > 0 && !stopsFilter.includes(f.stops)) return false;
      if (
        airlineFilter.length > 0 &&
        !airlineFilter.includes(f.segments[0].airline.name)
      )
        return false;
      return true;
    });

    switch (sortBy) {
      case "cheapest":
        results.sort((a, b) => a.price - b.price);
        break;
      case "fastest":
        results.sort((a, b) => a.totalDuration - b.totalDuration);
        break;
      case "best":
        results.sort(
          (a, b) =>
            a.price / 100 + a.totalDuration / 60 - (b.price / 100 + b.totalDuration / 60)
        );
        break;
    }
    return results;
  }, [allFlights, priceRange, stopsFilter, airlineFilter, sortBy]);

  const clearFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setStopsFilter([]);
    setAirlineFilter([]);
  };

  const hasFilters =
    priceRange[0] !== minPrice ||
    priceRange[1] !== maxPrice ||
    stopsFilter.length > 0 ||
    airlineFilter.length > 0;

  return (
    <section className="pb-16">
      {/* Hero / Search */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 pb-8 pt-10 lg:pt-14">
        <Container>
          {!hasSearched && (
            <div className="mb-8 max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Find your perfect flight
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Compare flights from 500+ airlines and book the best deal.
              </p>
            </div>
          )}
          <FlightSearchForm
            defaultValues={{
              origin,
              destination,
              departDate,
              returnDate,
              passengers,
              cabin,
              tripType,
            }}
            compact={hasSearched}
          />
        </Container>
      </div>

      {!hasSearched ? (
        <Container className="mt-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: DollarSign,
                title: "Best price guarantee",
                desc: "Find a lower price? We'll match it.",
              },
              {
                icon: Award,
                title: "Trusted by millions",
                desc: "Rated 4.9/5 by 2M+ travelers.",
              },
              {
                icon: Users,
                title: "24/7 support",
                desc: "Our team is here whenever you need us.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border bg-card p-6 transition-all hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      ) : (
        <Container className="mt-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                {origin} → {destination}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredFlights.length} flights · {passengers}{" "}
                {passengers === 1 ? "passenger" : "passengers"} · {cabin}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="gap-1.5 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            {/* Filters sidebar */}
            <aside
              className={cn(
                "space-y-6",
                !filtersOpen && "hidden lg:block"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Filters</h3>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Sort by</label>
                <div className="space-y-1">
                  {[
                    { value: "cheapest", label: "Cheapest" },
                    { value: "fastest", label: "Fastest" },
                    { value: "best", label: "Best value" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={cn(
                        "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        sortBy === opt.value
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-sm font-semibold mb-3 block">
                  Price range
                </label>
                <Slider
                  value={priceRange}
                  min={minPrice}
                  max={maxPrice}
                  step={50}
                  onValueChange={(v) => setPriceRange(v as [number, number])}
                />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
              </div>

              {/* Stops */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Stops</label>
                <div className="space-y-2">
                  {[0, 1, 2].map((stops) => (
                    <label
                      key={stops}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={stopsFilter.includes(stops)}
                        onCheckedChange={(checked) => {
                          setStopsFilter(
                            checked
                              ? [...stopsFilter, stops]
                              : stopsFilter.filter((s) => s !== stops)
                          );
                        }}
                      />
                      {stops === 0 ? "Direct" : `${stops} stop${stops > 1 ? "s" : ""}`}
                    </label>
                  ))}
                </div>
              </div>

              {/* Airlines */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Airlines
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableAirlines.map((airline) => (
                    <label
                      key={airline}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={airlineFilter.includes(airline)}
                        onCheckedChange={(checked) => {
                          setAirlineFilter(
                            checked
                              ? [...airlineFilter, airline]
                              : airlineFilter.filter((a) => a !== airline)
                          );
                        }}
                      />
                      {airline}
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Results */}
            <div className="space-y-4">
              {filteredFlights.length > 0 ? (
                filteredFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    searchParams={searchParams}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Plane}
                  title="No flights match your filters"
                  description="Try adjusting your filters or searching different dates."
                  actionLabel="Clear all filters"
                  onAction={clearFilters}
                />
              )}
            </div>
          </div>
        </Container>
      )}
    </section>
  );
}

export default function FlightsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading...</div>}>
      <FlightsContent />
    </Suspense>
  );
}
