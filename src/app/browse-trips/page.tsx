"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Container } from "@/components/shared/container";
import { TripCard } from "@/components/trips/trip-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useFilterTrips } from "@/hooks/use-filter-trips";

const continents = ["All", "Europe", "Asia", "Africa", "South America", "Oceania"];
const difficulties = ["All", "Easy", "Moderate", "Challenging"];
const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating", value: "rating" },
  { label: "Duration", value: "duration" },
];

export default function BrowseTripsPage() {
  const router = useRouter();
  const {
    search,
    setSearch,
    continent,
    setContinent,
    difficulty,
    setDifficulty,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    filtered,
    clearFilters,
    hasActiveFilters,
    priceRanges,
    tripsLoading,
    loadError,
  } = useFilterTrips();

  return (
    <section className="py-12 lg:py-16">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1 -ml-2 mb-4 text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/dashboard")}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Browse Adventures
          </h1>
          <p className="mt-2 text-muted-foreground">
            {tripsLoading
              ? "Loading trips…"
              : loadError
                ? loadError
                : `${filtered.length} trip${filtered.length !== 1 ? "s" : ""} available`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search destinations, trips..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={continent} onValueChange={(v) => v && setContinent(v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Continent" />
                </SelectTrigger>
                <SelectContent>
                  {continents.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(priceRange)}
                onValueChange={(v) => v && setPriceRange(Number(v))}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((p, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-1 text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {tripsLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
            <p className="text-sm">Loading adventures…</p>
          </div>
        ) : loadError ? (
          <EmptyState
            icon={SlidersHorizontal}
            title="Couldn’t load trips"
            description={loadError}
          />
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={SlidersHorizontal}
            title={
              hasActiveFilters
                ? "No trips match your filters"
                : "No trips available yet"
            }
            description={
              hasActiveFilters
                ? "Try adjusting your search or filters to find more adventures."
                : "Check back soon for new adventures, or try again later."
            }
            actionLabel={hasActiveFilters ? "Clear All Filters" : undefined}
            onAction={hasActiveFilters ? clearFilters : undefined}
          />
        )}
      </Container>
    </section>
  );
}
