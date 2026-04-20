"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plane,
  Hotel as HotelIcon,
  Compass,
  Search,
  Bell,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Sparkles,
  Star,
  TrendingUp,
  Clock,
  X,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BottomTabs } from "@/components/mobile/bottom-tabs";
import { Calendar as InlineCalendar } from "@/components/mobile/calendar";
import { MobileHomeSkeleton } from "@/components/mobile/home-skeleton";
import { useConversations } from "@/hooks/use-conversations";
import { trips } from "@/data/trips";
import { airports } from "@/data/airports";
import { cn } from "@/lib/utils";

const searchTabs = [
  { id: "trips", label: "Group Trips", icon: Compass, color: "text-violet-600" },
  { id: "flights", label: "Flights", icon: Plane, color: "text-blue-600" },
  { id: "hotels", label: "Hotels", icon: HotelIcon, color: "text-emerald-600" },
];

const popularDestinations = [
  { city: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80" },
  { city: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80" },
  { city: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80" },
  { city: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80" },
];

const todayISO = () => new Date().toISOString().split("T")[0];
const addDaysISO = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().split("T")[0];

const formatShortDate = (iso: string) => {
  if (!iso) return "Select";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function MobileHomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"trips" | "flights" | "hotels">("trips");
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState(addDaysISO(7));
  const [endDate, setEndDate] = useState(addDaysISO(14));
  const [pickerMode, setPickerMode] = useState<"start" | "end" | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const { totalUnread: unreadMessages } = useConversations("user");

  // Show skeleton briefly after sign in / sign up
  useEffect(() => {
    let justSignedIn = false;
    try {
      justSignedIn =
        sessionStorage.getItem("packpally_just_signed_in") === "1";
    } catch {}

    if (!justSignedIn) return;

    setLoading(true);

    const t = setTimeout(() => {
      setLoading(false);
      try {
        sessionStorage.removeItem("packpally_just_signed_in");
      } catch {}
    }, 2000);

    return () => clearTimeout(t);
  }, []);

  // Build suggestion pool per tab
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (activeTab === "flights") {
      const all = airports.map((a) => ({
        primary: `${a.city}`,
        secondary: `${a.name} (${a.code})`,
        tag: a.country,
        icon: "airport" as const,
      }));
      const filtered = q
        ? all.filter(
            (s) =>
              s.primary.toLowerCase().includes(q) ||
              s.secondary.toLowerCase().includes(q) ||
              s.tag.toLowerCase().includes(q)
          )
        : all.slice(0, 6);
      return filtered.slice(0, 6);
    }

    if (activeTab === "hotels") {
      // Unique city+country pairs from trips + popular
      const seen = new Set<string>();
      const pool: {
        primary: string;
        secondary: string;
        tag: string;
        icon: "hotel" | "city";
      }[] = [];
      [
        ...popularDestinations.map((p) => ({ city: p.city, country: p.country })),
        ...trips.map((t) => ({ city: t.destination, country: t.country })),
      ].forEach((d) => {
        const key = `${d.city}-${d.country}`;
        if (seen.has(key)) return;
        seen.add(key);
        pool.push({
          primary: d.city,
          secondary: d.country,
          tag: "City",
          icon: "city",
        });
      });
      const filtered = q
        ? pool.filter(
            (s) =>
              s.primary.toLowerCase().includes(q) ||
              s.secondary.toLowerCase().includes(q)
          )
        : pool.slice(0, 6);
      return filtered.slice(0, 6);
    }

    // trips
    const tripPool = trips.map((t) => ({
      primary: t.title,
      secondary: `${t.destination}, ${t.country}`,
      tag: t.category[0],
      icon: "trip" as const,
      id: t.id,
    }));
    const filtered = q
      ? tripPool.filter(
          (s) =>
            s.primary.toLowerCase().includes(q) ||
            s.secondary.toLowerCase().includes(q) ||
            s.tag.toLowerCase().includes(q)
        )
      : tripPool.slice(0, 6);
    return filtered.slice(0, 6);
  }, [activeTab, query]);

  const pickSuggestion = (label: string) => {
    setQuery(label);
    setInputFocused(false);
  };

  const handleDateSelect = (iso: string) => {
    if (pickerMode === "start") {
      setStartDate(iso);
      if (endDate < iso) {
        const nextEnd = new Date(iso);
        nextEnd.setDate(nextEnd.getDate() + 7);
        setEndDate(nextEnd.toISOString().split("T")[0]);
      }
      setPickerMode("end");
    } else if (pickerMode === "end") {
      setEndDate(iso);
      setPickerMode(null);
    }
  };

  const featured = trips.slice(0, 4);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "trips") {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      router.push(`/mobile/search/trips?${params.toString()}`);
    } else if (activeTab === "flights") {
      const params = new URLSearchParams({
        origin: "New York",
        destination: query || "Paris",
        departDate: startDate,
        returnDate: endDate,
        passengers: "1",
        cabin: "economy",
      });
      router.push(`/mobile/search/flights?${params.toString()}`);
    } else {
      const params = new URLSearchParams({
        location: query || "Paris, France",
        checkIn: startDate,
        checkOut: endDate,
        guests: "2",
        rooms: "1",
      });
      router.push(`/mobile/search/hotels?${params.toString()}`);
    }
  };

  if (loading) {
    return <MobileHomeSkeleton />;
  }

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      {/* Top header with greeting */}
      <div className="bg-gradient-to-br from-primary via-primary to-blue-700 text-white px-5 pb-6 md:pt-14 pt-5 rounded-b-3xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0">
              <Image
                src="/logo.png"
                alt="Pack & Pally"
                fill
                className="object-contain"
                sizes="44px"
              />
            </div>
            <div>
              <p className="text-xs text-white/70">Hello, Explorer</p>
              <p className="text-lg font-bold leading-tight">Where to next?</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/mobile/messages"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {unreadMessages > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link
              href="/mobile/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-400" />
            </Link>
          </div>
        </div>

        {/* Search card (floating) */}
        <div className="rounded-2xl bg-white text-foreground p-4 shadow-xl">
          {/* Tabs */}
          <div className="flex gap-1 mb-3 overflow-x-auto">
            {searchTabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                    active
                      ? "bg-primary text-white"
                      : "text-muted-foreground"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Input
                placeholder={
                  activeTab === "trips"
                    ? "Search destinations..."
                    : activeTab === "flights"
                    ? "Where to?"
                    : "Where are you going?"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 200)}
                className="pl-9 pr-9 h-11"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors z-10"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}

              {/* Suggestions dropdown */}
              {inputFocused && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border bg-white shadow-lg z-20 overflow-hidden animate-[fade-in-up_180ms_ease-out]">
                  <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1.5">
                    {query ? (
                      <Search className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    )}
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {query ? "Matches" : "Popular"}
                    </p>
                  </div>
                  <div className="max-h-[260px] overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <button
                        key={`${s.primary}-${i}`}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickSuggestion(s.primary)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                            s.icon === "airport" && "bg-blue-50 text-blue-600",
                            s.icon === "city" && "bg-emerald-50 text-emerald-600",
                            s.icon === "trip" && "bg-violet-50 text-violet-600"
                          )}
                        >
                          {s.icon === "airport" && <Plane className="h-3.5 w-3.5" />}
                          {s.icon === "city" && <MapPin className="h-3.5 w-3.5" />}
                          {s.icon === "trip" && <Compass className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {s.primary}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {s.secondary}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 rounded-full bg-muted px-2 py-0.5 capitalize">
                          {s.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() =>
                  setPickerMode(pickerMode === "start" ? null : "start")
                }
                className={cn(
                  "rounded-lg border p-2.5 transition-colors text-left",
                  pickerMode === "start"
                    ? "border-primary bg-primary/5"
                    : "border-border/70 hover:border-primary/40"
                )}
              >
                <p className="text-[10px] text-muted-foreground">
                  {activeTab === "flights" ? "Depart" : "Check-in"}
                </p>
                <p className="text-xs font-semibold flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3 text-primary" />
                  {formatShortDate(startDate)}
                </p>
              </button>
              <button
                type="button"
                onClick={() =>
                  setPickerMode(pickerMode === "end" ? null : "end")
                }
                className={cn(
                  "rounded-lg border p-2.5 transition-colors text-left",
                  pickerMode === "end"
                    ? "border-primary bg-primary/5"
                    : "border-border/70 hover:border-primary/40"
                )}
              >
                <p className="text-[10px] text-muted-foreground">
                  {activeTab === "flights" ? "Return" : "Check-out"}
                </p>
                <p className="text-xs font-semibold flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3 text-primary" />
                  {formatShortDate(endDate)}
                </p>
              </button>
            </div>

            {/* Inline calendar */}
            {pickerMode && (
              <div className="mt-3 rounded-xl border p-3 animate-[fade-in-up_200ms_ease-out]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  Select{" "}
                  {pickerMode === "start"
                    ? activeTab === "flights"
                      ? "depart date"
                      : "check-in"
                    : activeTab === "flights"
                    ? "return date"
                    : "check-out"}
                </p>
                <InlineCalendar
                  selected={pickerMode === "start" ? startDate : endDate}
                  onSelect={handleDateSelect}
                  minDate={pickerMode === "end" ? startDate : todayISO()}
                  highlightColor="bg-primary text-white"
                />
              </div>
            )}

            <Button type="submit" className="w-full mt-3 h-11 gap-1.5">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* AI shortcut */}
        <div className="px-5 mt-5">
          <Link
            href="/mobile/ai/trip-generator"
            className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-primary p-4 text-white shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">AI Trip Generator</p>
              <p className="text-xs text-white/80">Create a trip in seconds</p>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Popular destinations */}
        <div className="mt-6 px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">Popular destinations</h2>
            <Link
              href="/mobile/explore"
              className="text-xs font-semibold text-primary"
            >
              See all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto -mx-5 px-5 scrollbar-hide pb-2">
            {popularDestinations.map((d) => (
              <Link
                key={d.city}
                href={`/mobile/search/hotels?location=${encodeURIComponent(`${d.city}, ${d.country}`)}`}
                className="relative h-36 w-32 shrink-0 rounded-2xl overflow-hidden"
              >
                <Image
                  src={d.image}
                  alt={d.city}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p className="text-sm font-bold leading-tight">{d.city}</p>
                  <p className="text-[10px] opacity-80">{d.country}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured trips */}
        <div className="mt-6 px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">Featured adventures</h2>
            <Link
              href="/mobile/search/trips"
              className="text-xs font-semibold text-primary"
            >
              See all
            </Link>
          </div>
          <div className="space-y-3">
            {featured.map((trip) => (
              <Link
                key={trip.id}
                href={`/mobile/trips/${trip.id}`}
                className="block rounded-2xl bg-white overflow-hidden border"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={trip.coverImage}
                    alt={trip.title}
                    fill
                    className="object-cover"
                    sizes="360px"
                  />
                  <Badge className="absolute top-3 left-3 bg-white/90 text-foreground border-0 text-[10px]">
                    {trip.category[0]}
                  </Badge>
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm leading-tight line-clamp-1">
                        {trip.title}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {trip.destination}, {trip.country}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs shrink-0">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{trip.rating}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-3 w-3" />
                        {trip.durationDays}d
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Users className="h-3 w-3" />
                        {trip.currentBookings}/{trip.maxGroupSize}
                      </span>
                    </div>
                    <p className="text-sm font-bold">
                      ${trip.price.toLocaleString()}
                      <span className="text-[10px] font-normal text-muted-foreground">/pp</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>

      <BottomTabs />
    </div>
  );
}
