"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const popularLocations = [
  "Paris, France",
  "New York, USA",
  "Tokyo, Japan",
  "London, UK",
  "Dubai, UAE",
  "Barcelona, Spain",
  "Bali, Indonesia",
  "Rome, Italy",
  "Bangkok, Thailand",
  "Santorini, Greece",
  "Amsterdam, Netherlands",
  "Singapore",
];

interface HotelSearchFormProps {
  defaultValues?: {
    location?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    rooms?: number;
  };
  compact?: boolean;
}

export function HotelSearchForm({ defaultValues, compact }: HotelSearchFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const weekLater = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [location, setLocation] = useState(defaultValues?.location || "");
  const [checkIn, setCheckIn] = useState(defaultValues?.checkIn || tomorrow);
  const [checkOut, setCheckOut] = useState(defaultValues?.checkOut || weekLater);
  const [guests, setGuests] = useState(defaultValues?.guests || 2);
  const [rooms, setRooms] = useState(defaultValues?.rooms || 1);
  const [locationOpen, setLocationOpen] = useState(false);

  const filteredLocations = popularLocations.filter((loc) =>
    loc.toLowerCase().includes(location.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
    const params = new URLSearchParams({
      location,
      checkIn,
      checkOut,
      guests: String(guests),
      rooms: String(rooms),
    });
    router.push(`/hotels?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-2xl bg-white p-4 sm:p-6 shadow-lg",
        !compact && "border"
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-end">
        {/* Location */}
        <div className="relative">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Where to?
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="City, region, or landmark"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setLocationOpen(true);
              }}
              onFocus={() => setLocationOpen(true)}
              onBlur={() => setTimeout(() => setLocationOpen(false), 200)}
              className="pl-9 h-12"
            />
          </div>
          {locationOpen && filteredLocations.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-64 overflow-y-auto rounded-lg border bg-white shadow-lg">
              {filteredLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors flex items-center gap-2"
                  onClick={() => {
                    setLocation(loc);
                    setLocationOpen(false);
                  }}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{loc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Check-in */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Check-in
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              className="pl-9 h-12"
            />
          </div>
        </div>

        {/* Check-out */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Check-out
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="pl-9 h-12"
            />
          </div>
        </div>

        {/* Guests & Rooms */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Guests
          </label>
          <Select
            value={`${guests}-${rooms}`}
            onValueChange={(v) => {
              if (!v) return;
              const [g, r] = v.split("-").map(Number);
              setGuests(g);
              setRooms(r);
            }}
          >
            <SelectTrigger className="h-12">
              <Users className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                { g: 1, r: 1 },
                { g: 2, r: 1 },
                { g: 3, r: 1 },
                { g: 4, r: 1 },
                { g: 4, r: 2 },
                { g: 6, r: 2 },
                { g: 8, r: 3 },
              ].map((opt) => (
                <SelectItem key={`${opt.g}-${opt.r}`} value={`${opt.g}-${opt.r}`}>
                  {opt.g} {opt.g === 1 ? "guest" : "guests"} · {opt.r}{" "}
                  {opt.r === 1 ? "room" : "rooms"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submit */}
        <div>
          <Button type="submit" size="lg" className="h-12 w-full lg:w-auto gap-2 px-6">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
