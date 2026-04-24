"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Star, MapPin, Heart, Check, Hotel as HotelIcon } from "lucide-react";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { BottomSheet } from "@/components/mobile/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  generateHotels,
  formatHotelPrice,
  calculateNights,
} from "@/lib/hotel-generator";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

const AMENITY_OPTIONS = [
  "Free WiFi",
  "Pool",
  "Spa",
  "Restaurant",
  "Bar",
  "Fitness Center",
  "Parking",
  "Air Conditioning",
  "Beach Access",
  "Breakfast Included",
];

const PROPERTY_TYPES = [
  { value: "hotel", label: "Hotel" },
  { value: "apartment", label: "Apartment" },
  { value: "resort", label: "Resort" },
  { value: "villa", label: "Villa" },
  { value: "hostel", label: "Hostel" },
];

function HotelSearchContent() {
  const searchParams = useSearchParams();
  const location = searchParams.get("location") || "Paris, France";
  const checkIn =
    searchParams.get("checkIn") ||
    new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const checkOut =
    searchParams.get("checkOut") ||
    new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0];
  const guests = Number(searchParams.get("guests") || "2");
  const rooms = Number(searchParams.get("rooms") || "1");

  const hotels = useMemo(
    () => generateHotels({ location, checkIn, checkOut, guests, rooms }),
    [location, checkIn, checkOut, guests, rooms]
  );

  const nights = calculateNights(checkIn, checkOut);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const wishlist = useWishlist();

  // Filter bounds
  const { priceMin, priceMax } = useMemo(() => {
    const prices = hotels.map((h) => h.pricePerNight * nights);
    return {
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
    };
  }, [hotels, nights]);

  const [priceMaxFilter, setPriceMaxFilter] = useState<number | null>(null);
  const [minStars, setMinStars] = useState<number>(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"recommended" | "price" | "rating">(
    "recommended"
  );

  const results = useMemo(() => {
    let list = [...hotels];
    if (priceMaxFilter !== null)
      list = list.filter((h) => h.pricePerNight * nights <= priceMaxFilter);
    if (minStars > 0) list = list.filter((h) => h.starRating >= minStars);
    if (selectedAmenities.length)
      list = list.filter((h) =>
        selectedAmenities.every((a) => h.amenities.includes(a))
      );
    if (selectedTypes.length)
      list = list.filter((h) => selectedTypes.includes(h.propertyType));

    if (sortBy === "price") list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);

    return list.slice(0, 20);
  }, [
    hotels,
    priceMaxFilter,
    minStars,
    selectedAmenities,
    selectedTypes,
    sortBy,
    nights,
  ]);

  const activeFilterCount =
    (priceMaxFilter !== null ? 1 : 0) +
    (minStars > 0 ? 1 : 0) +
    (selectedAmenities.length ? 1 : 0) +
    (selectedTypes.length ? 1 : 0);

  const clearAll = () => {
    setPriceMaxFilter(null);
    setMinStars(0);
    setSelectedAmenities([]);
    setSelectedTypes([]);
  };

  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  const toggleType = (t: string) =>
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title={location.split(",")[0]}
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

      {/* Subline */}
      <div className="bg-white border-b px-4 py-2 text-xs text-muted-foreground">
        {new Date(checkIn).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
        {" - "}
        {new Date(checkOut).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
        {" · "}
        {nights} night{nights !== 1 ? "s" : ""} · {guests} guest
        {guests !== 1 ? "s" : ""}
      </div>

      {/* Sort */}
      <div className="bg-white px-4 py-2 border-b">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {[
            { value: "recommended", label: "Recommended" },
            { value: "price", label: "Price" },
            { value: "rating", label: "Rating" },
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
            {results.length} {results.length === 1 ? "property" : "properties"} found
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
            <HotelIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="font-semibold text-sm">
              No properties match your filters
            </p>
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
          results.map((hotel) => {
            const total = hotel.pricePerNight * nights;
            const isSaved = wishlist.isSaved(hotel.id, "hotel");
            return (
              <Link
                key={hotel.id}
                href={`/mobile/hotels/${hotel.id}?${new URLSearchParams({
                  location,
                  checkIn,
                  checkOut,
                  guests: String(guests),
                  rooms: String(rooms),
                }).toString()}`}
                className="block rounded-2xl bg-white border overflow-hidden"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={hotel.coverImage}
                    alt={hotel.name}
                    fill
                    className="object-cover"
                    sizes="360px"
                  />
                  <button
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      wishlist.toggle({
                        id: hotel.id,
                        type: "hotel",
                        title: hotel.name,
                        subtitle: `${hotel.city}, ${hotel.country}`,
                        image: hotel.coverImage,
                        price: hotel.pricePerNight,
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
                  <div className="absolute bottom-3 left-3 flex items-center gap-0.5 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5">
                    {Array.from({ length: hotel.starRating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-2.5 w-2.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm leading-tight line-clamp-1 flex-1">
                      {hotel.name}
                    </h3>
                    <div className="flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 shrink-0">
                      <span className="text-[11px] font-bold text-primary">
                        {hotel.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {hotel.neighborhood} · {hotel.distanceFromCenter}km from center
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {hotel.amenities.slice(0, 3).map((a) => (
                      <Badge
                        key={a}
                        variant="secondary"
                        className="text-[9px] font-normal py-0"
                      >
                        {a}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-end justify-between mt-2 pt-2 border-t">
                    <span className="text-[10px] text-muted-foreground">
                      {hotel.reviewCount.toLocaleString()} reviews
                    </span>
                    <div className="text-right">
                      <p className="text-base font-bold">
                        {formatHotelPrice(total)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {nights} night{nights !== 1 ? "s" : ""} total
                      </p>
                    </div>
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
              Show {results.length} stays
            </Button>
          </div>
        }
      >
        <div className="space-y-6 pb-2">
          {/* Price */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm">Max price (total)</h3>
              <span className="text-xs font-semibold">
                {formatHotelPrice(priceMaxFilter ?? priceMax)}
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
              <span>{formatHotelPrice(priceMin)}</span>
              <span>{formatHotelPrice(priceMax)}</span>
            </div>
          </div>

          {/* Star rating */}
          <div>
            <h3 className="font-bold text-sm mb-2">Star rating</h3>
            <div className="grid grid-cols-5 gap-2">
              {[0, 2, 3, 4, 5].map((n) => {
                const active = minStars === n;
                return (
                  <button
                    key={n}
                    onClick={() => setMinStars(n)}
                    className={cn(
                      "rounded-xl border py-2 text-[11px] font-semibold transition-all",
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    {n === 0 ? "Any" : `${n}+★`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Property types */}
          <div>
            <h3 className="font-bold text-sm mb-2">Property type</h3>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((t) => {
                const active = selectedTypes.includes(t.value);
                return (
                  <button
                    key={t.value}
                    onClick={() => toggleType(t.value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="font-bold text-sm mb-2">Amenities</h3>
            <div className="space-y-1.5">
              {AMENITY_OPTIONS.map((a) => {
                const active = selectedAmenities.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleAmenity(a)}
                    className="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-xs font-medium">{a}</span>
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                        active ? "border-primary bg-primary" : "border-border"
                      )}
                    >
                      {active && <Check className="h-3 w-3 text-white" />}
                    </div>
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

export default function MobileHotelSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[844px] items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <HotelSearchContent />
    </Suspense>
  );
}
