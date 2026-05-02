"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Hotel, SlidersHorizontal, Star, Shield, Sparkles } from "lucide-react";
import { Container } from "@/components/shared/container";
import { HotelSearchForm } from "@/components/hotels/hotel-search-form";
import { HotelCard } from "@/components/hotels/hotel-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { generateHotels, formatHotelPrice } from "@/lib/hotel-generator";
import { cn } from "@/lib/utils";

const popularDestinations = [
  { city: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80" },
  { city: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80" },
  { city: "New York", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80" },
  { city: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80" },
  { city: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80" },
  { city: "Barcelona", country: "Spain", image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80" },
];

function HotelsContent() {
  const searchParams = useSearchParams();
  const location = searchParams.get("location") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = Number(searchParams.get("guests") || "2");
  const rooms = Number(searchParams.get("rooms") || "1");

  const hasSearched = Boolean(location && checkIn && checkOut);

  const allHotels = useMemo(() => {
    if (!hasSearched) return [];
    return generateHotels({ location, checkIn, checkOut, guests, rooms });
  }, [location, checkIn, checkOut, guests, rooms, hasSearched]);

  const maxPrice = allHotels.length > 0 ? Math.max(...allHotels.map((h) => h.pricePerNight)) : 1000;
  const minPrice = allHotels.length > 0 ? Math.min(...allHotels.map((h) => h.pricePerNight)) : 0;

  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);
  const [starFilter, setStarFilter] = useState<number[]>([]);
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const topAmenities = ["Free WiFi", "Swimming Pool", "Breakfast Included", "Fitness Center", "Spa", "Parking"];
  const propertyTypes = ["hotel", "apartment", "resort", "villa", "hostel"];

  const filteredHotels = useMemo(() => {
    let results = allHotels.filter((h) => {
      if (h.pricePerNight < priceRange[0] || h.pricePerNight > priceRange[1]) return false;
      if (starFilter.length > 0 && !starFilter.includes(h.starRating)) return false;
      if (
        amenityFilter.length > 0 &&
        !amenityFilter.every((a) => h.amenities.includes(a))
      )
        return false;
      if (
        propertyTypeFilter.length > 0 &&
        !propertyTypeFilter.includes(h.propertyType)
      )
        return false;
      return true;
    });

    switch (sortBy) {
      case "price-low":
        results.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case "price-high":
        results.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case "rating":
        results.sort((a, b) => b.rating - a.rating);
        break;
    }
    return results;
  }, [allHotels, priceRange, starFilter, amenityFilter, propertyTypeFilter, sortBy]);

  const clearFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setStarFilter([]);
    setAmenityFilter([]);
    setPropertyTypeFilter([]);
  };

  const hasFilters =
    priceRange[0] !== minPrice ||
    priceRange[1] !== maxPrice ||
    starFilter.length > 0 ||
    amenityFilter.length > 0 ||
    propertyTypeFilter.length > 0;

  return (
    <section className="pb-16">
      {/* Hero / Search */}
      <div className="bg-gradient-to-br from-emerald-50 via-background to-primary/5 pb-8 pt-10 lg:pt-14">
        <Container>
          {!hasSearched && (
            <div className="mb-8 max-w-3xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Find your perfect stay
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Compare hotels worldwide. Save on your next trip.
              </p>
            </div>
          )}
          <HotelSearchForm
            defaultValues={{ location, checkIn, checkOut, guests, rooms }}
            compact={hasSearched}
          />
        </Container>
      </div>

      {!hasSearched ? (
        <>
          {/* Popular destinations */}
          <Container className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Popular destinations</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {popularDestinations.map((d) => (
                <Link
                  key={d.city}
                  href={`/hotels?location=${encodeURIComponent(`${d.city}, ${d.country}`)}&checkIn=${new Date(Date.now() + 86400000).toISOString().split("T")[0]}&checkOut=${new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0]}&guests=2&rooms=1`}
                  className="group relative aspect-square overflow-hidden rounded-2xl"
                >
                  <Image
                    src={d.image}
                    alt={d.city}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="font-bold">{d.city}</p>
                    <p className="text-xs opacity-80">{d.country}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>

          {/* Features */}
          <Container className="mt-16">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[
                { icon: Shield, title: "Price guarantee", desc: "Find it cheaper? We'll refund the difference." },
                { icon: Sparkles, title: "Curated selection", desc: "Only the best hotels make our list." },
                { icon: Star, title: "Millions of reviews", desc: "Real reviews from real travelers." },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border bg-card p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </Container>
        </>
      ) : (
        <Container className="mt-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                Hotels in {location}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredHotels.length} properties · {guests}{" "}
                {guests === 1 ? "guest" : "guests"} · {rooms}{" "}
                {rooms === 1 ? "room" : "rooms"}
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
            {/* Filters */}
            <aside className={cn("space-y-6", !filtersOpen && "hidden lg:block")}>
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
                    { value: "recommended", label: "Recommended" },
                    { value: "price-low", label: "Price: Low to High" },
                    { value: "price-high", label: "Price: High to Low" },
                    { value: "rating", label: "Rating" },
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

              {/* Price per night */}
              <div>
                <label className="text-sm font-semibold mb-3 block">
                  Price per night
                </label>
                <Slider
                  value={priceRange}
                  min={minPrice}
                  max={maxPrice}
                  step={25}
                  onValueChange={(v) => setPriceRange(v as [number, number])}
                />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatHotelPrice(priceRange[0])}</span>
                  <span>{formatHotelPrice(priceRange[1])}</span>
                </div>
              </div>

              {/* Star rating */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Star rating
                </label>
                <div className="space-y-2">
                  {[5, 4, 3, 2].map((stars) => (
                    <label
                      key={stars}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={starFilter.includes(stars)}
                        onCheckedChange={(checked) => {
                          setStarFilter(
                            checked
                              ? [...starFilter, stars]
                              : starFilter.filter((s) => s !== stars)
                          );
                        }}
                      />
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: stars }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Amenities
                </label>
                <div className="space-y-2">
                  {topAmenities.map((a) => (
                    <label
                      key={a}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={amenityFilter.includes(a)}
                        onCheckedChange={(checked) => {
                          setAmenityFilter(
                            checked
                              ? [...amenityFilter, a]
                              : amenityFilter.filter((x) => x !== a)
                          );
                        }}
                      />
                      {a}
                    </label>
                  ))}
                </div>
              </div>

              {/* Property type */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Property type
                </label>
                <div className="space-y-2">
                  {propertyTypes.map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 text-sm cursor-pointer capitalize"
                    >
                      <Checkbox
                        checked={propertyTypeFilter.includes(t)}
                        onCheckedChange={(checked) => {
                          setPropertyTypeFilter(
                            checked
                              ? [...propertyTypeFilter, t]
                              : propertyTypeFilter.filter((x) => x !== t)
                          );
                        }}
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Results */}
            <div className="space-y-4">
              {filteredHotels.length > 0 ? (
                filteredHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    searchParams={searchParams}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Hotel}
                  title="No hotels match your filters"
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

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading...</div>}>
      <HotelsContent />
    </Suspense>
  );
}
