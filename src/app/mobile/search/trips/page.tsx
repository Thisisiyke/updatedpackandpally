"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  Calendar,
  Users,
  Star,
  MapPin,
  Heart,
  Check,
  Compass,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { trips } from "@/data/trips";
import { isDiscoverable } from "@/lib/trip-visibility";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

const continents = ["All", "Europe", "Asia", "Africa", "South America", "Oceania"];
const difficulties = ["Easy", "Moderate", "Challenging"];
const categories = [
  "Cultural",
  "Adventure",
  "Wellness",
  "Culinary",
  "Trekking",
  "Safari",
  "Coastal",
  "Spiritual",
  "Historical",
];

export default function MobileTripsSearchPage() {
  const [search, setSearch] = useState("");
  const [continent, setContinent] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const wishlist = useWishlist();

  const { priceMin, priceMax } = useMemo(() => {
    const prices = trips.map((t) => t.price);
    return {
      priceMin: Math.min(...prices),
      priceMax: Math.max(...prices),
    };
  }, []);

  const [priceMaxFilter, setPriceMaxFilter] = useState<number | null>(null);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [durationMax, setDurationMax] = useState<number | null>(null);

  const results = useMemo(() => {
    return trips.filter((t) => {
      if (!isDiscoverable(t)) return false;
      if (continent !== "All" && t.continent !== continent) return false;
      if (priceMaxFilter !== null && t.price > priceMaxFilter) return false;
      if (durationMax !== null && t.durationDays > durationMax) return false;
      if (
        selectedDifficulties.length &&
        !selectedDifficulties.includes(t.difficulty)
      )
        return false;
      if (
        selectedCategories.length &&
        !t.category.some((c) => selectedCategories.includes(c))
      )
        return false;
      if (
        search &&
        !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !t.destination.toLowerCase().includes(search.toLowerCase()) &&
        !t.country.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [
    search,
    continent,
    priceMaxFilter,
    durationMax,
    selectedDifficulties,
    selectedCategories,
  ]);

  const activeFilterCount =
    (priceMaxFilter !== null ? 1 : 0) +
    (durationMax !== null ? 1 : 0) +
    (selectedDifficulties.length ? 1 : 0) +
    (selectedCategories.length ? 1 : 0);

  const clearAll = () => {
    setPriceMaxFilter(null);
    setDurationMax(null);
    setSelectedDifficulties([]);
    setSelectedCategories([]);
  };

  const toggleDifficulty = (d: string) =>
    setSelectedDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  const toggleCategory = (c: string) =>
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title="Group Trips"
        action={
          <button
            onClick={() => setFiltersOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-muted/50"
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white border-b px-4 py-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Destination, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-muted/50 border-0"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {continents.map((c) => (
            <button
              key={c}
              onClick={() => setContinent(c)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                continent === c
                  ? "border-primary bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {results.length} trip{results.length !== 1 ? "s" : ""} found
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
            <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="font-semibold text-sm">No trips match your filters</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={clearAll}>
              Clear filters
            </Button>
          </div>
        ) : (
          results.map((trip) => {
            const isSaved = wishlist.isSaved(trip.id, "trip");
            return (
              <Link
                key={trip.id}
                href={`/mobile/trips/${trip.id}`}
                className="block rounded-2xl bg-white border overflow-hidden"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={trip.coverImage}
                    alt={trip.title}
                    fill
                    className="object-cover"
                    sizes="360px"
                  />
                  <button
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      wishlist.toggle({
                        id: trip.id,
                        type: "trip",
                        title: trip.title,
                        subtitle: `${trip.destination}, ${trip.country}`,
                        image: trip.coverImage,
                        price: trip.price,
                      });
                    }}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        isSaved
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground"
                      )}
                    />
                  </button>
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    {trip.category.slice(0, 2).map((c) => (
                      <Badge
                        key={c}
                        className="bg-white/90 text-foreground border-0 text-[10px]"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm leading-tight flex-1">
                      {trip.title}
                    </h3>
                    <div className="flex items-center gap-0.5 text-xs shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{trip.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {trip.destination}, {trip.country}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-3 w-3" />
                        {trip.durationDays} days
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        {trip.currentBookings}/{trip.maxGroupSize}
                      </span>
                    </div>
                    <p className="text-base font-bold">
                      ${trip.price.toLocaleString()}
                      <span className="text-[10px] font-normal text-muted-foreground">
                        /pp
                      </span>
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Filters sheet */}
      <BottomSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-11" onClick={clearAll}>
              Clear all
            </Button>
            <Button
              className="flex-1 h-11"
              onClick={() => setFiltersOpen(false)}
            >
              Show {results.length} trips
            </Button>
          </div>
        }
      >
        <div className="space-y-6 pb-2">
          {/* Price */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm">Max price</h3>
              <span className="text-xs font-semibold">
                ${(priceMaxFilter ?? priceMax).toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={priceMin}
              max={priceMax}
              step={100}
              value={priceMaxFilter ?? priceMax}
              onChange={(e) => setPriceMaxFilter(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
              <span>${priceMin.toLocaleString()}</span>
              <span>${priceMax.toLocaleString()}</span>
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm">Max duration</h3>
              <span className="text-xs font-semibold">
                {durationMax ?? 14} days
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={14}
              step={1}
              value={durationMax ?? 14}
              onChange={(e) => setDurationMax(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
              <span>3 days</span>
              <span>14 days</span>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <h3 className="font-bold text-sm mb-2">Difficulty</h3>
            <div className="grid grid-cols-3 gap-2">
              {difficulties.map((d) => {
                const active = selectedDifficulties.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDifficulty(d)}
                    className={cn(
                      "rounded-xl border py-2 text-xs font-semibold transition-all",
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-sm mb-2">Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = selectedCategories.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCategory(c)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
