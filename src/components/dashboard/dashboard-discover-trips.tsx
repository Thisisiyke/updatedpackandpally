"use client";

import Link from "next/link";
import { MapPin, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/trip-card";
import { TRIP_TYPE_FILTER_OPTIONS } from "@/lib/trip-type-filter-options";
import { useDashboardDiscoverTrips } from "@/hooks/use-dashboard-discover-trips";
import { cn } from "@/lib/utils";

export function DashboardDiscoverTrips({ enabled }: { enabled: boolean }) {
  const {
    selectedTripTypes,
    toggleTripType,
    clearTripTypes,
    countryName,
    geoState,
    nearTrips,
    otherTrips,
    loading,
  } = useDashboardDiscoverTrips(enabled);

  const locationHint =
    geoState === "loading"
      ? "Detecting your area…"
      : geoState === "denied"
        ? "Location off — showing all featured trips. Allow location for country matches."
        : geoState === "error"
          ? "Could not detect location — showing featured trips."
          : countryName
            ? `Showing trips for ${countryName} and worldwide picks.`
            : "Personalized trip ideas for you.";

  const hasAny = nearTrips.length > 0 || otherTrips.length > 0;

  return (
    <div className="rounded-xl border bg-white p-5 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Discover trips
          </div>
          <p className="mt-1 text-sm text-muted-foreground flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            {locationHint}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href="/browse-trips">Browse all</Link>
        </Button>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Trip types (same as app filters)
        </p>
        <div className="flex flex-wrap gap-2 max-h-[7.5rem] overflow-y-auto pr-1">
          {TRIP_TYPE_FILTER_OPTIONS.map((opt) => {
            const on = selectedTripTypes.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleTripType(opt)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  on
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/80"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {selectedTripTypes.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-8 text-xs text-muted-foreground"
            onClick={clearTripTypes}
          >
            Clear trip types
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading trips…
        </div>
      ) : !hasAny ? (
        <p className="text-sm text-muted-foreground py-6 text-center">
          No trips match these filters right now.{" "}
          <Link href="/browse-trips" className="text-primary underline-offset-4 hover:underline">
            Browse all trips
          </Link>
        </p>
      ) : (
        <div className="space-y-8">
          {nearTrips.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">
                {countryName ? `In ${countryName}` : "Near you"}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {nearTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </div>
          )}
          {otherTrips.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">
                {nearTrips.length > 0 ? "More adventures" : "Featured trips"}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {otherTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
