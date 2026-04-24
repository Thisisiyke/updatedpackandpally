"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users, ArrowLeftRight, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { airports } from "@/data/airports";
import { cn } from "@/lib/utils";

interface FlightSearchFormProps {
  defaultValues?: {
    origin?: string;
    destination?: string;
    departDate?: string;
    returnDate?: string;
    passengers?: number;
    cabin?: string;
    tripType?: string;
  };
  compact?: boolean;
}

export function FlightSearchForm({ defaultValues, compact }: FlightSearchFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const weekAfter = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [tripType, setTripType] = useState(defaultValues?.tripType || "roundtrip");
  const [origin, setOrigin] = useState(defaultValues?.origin || "");
  const [destination, setDestination] = useState(defaultValues?.destination || "");
  const [departDate, setDepartDate] = useState(defaultValues?.departDate || nextWeek);
  const [returnDate, setReturnDate] = useState(defaultValues?.returnDate || weekAfter);
  const [passengers, setPassengers] = useState(defaultValues?.passengers || 1);
  const [cabin, setCabin] = useState(defaultValues?.cabin || "economy");

  const [originOpen, setOriginOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    const params = new URLSearchParams({
      origin,
      destination,
      departDate,
      passengers: String(passengers),
      cabin,
      tripType,
    });
    if (tripType === "roundtrip") {
      params.set("returnDate", returnDate);
    }
    router.push(`/flights?${params.toString()}`);
  };

  const swapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const filteredOrigins = airports
    .filter((a) => origin === "" || a.city.toLowerCase().includes(origin.toLowerCase()) || a.code.toLowerCase().includes(origin.toLowerCase()))
    .slice(0, 6);

  const filteredDests = airports
    .filter((a) => destination === "" || a.city.toLowerCase().includes(destination.toLowerCase()) || a.code.toLowerCase().includes(destination.toLowerCase()))
    .slice(0, 6);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-2xl bg-white p-4 sm:p-6 shadow-lg",
        !compact && "border"
      )}
    >
      {/* Trip type + cabin */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex rounded-lg border p-1">
          {[
            { value: "roundtrip", label: "Round trip" },
            { value: "oneway", label: "One way" },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTripType(t.value)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                tripType === t.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Select value={cabin} onValueChange={(v) => v && setCabin(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="economy">Economy</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="first">First Class</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={String(passengers)}
          onValueChange={(v) => v && setPassengers(Number(v))}
        >
          <SelectTrigger className="w-[140px]">
            <Users className="h-4 w-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} {n === 1 ? "passenger" : "passengers"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_1fr_auto] gap-3 items-end">
        {/* Origin */}
        <div className="relative">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-45" />
            <Input
              placeholder="City or airport"
              value={origin}
              onChange={(e) => {
                setOrigin(e.target.value);
                setOriginOpen(true);
              }}
              onFocus={() => setOriginOpen(true)}
              onBlur={() => setTimeout(() => setOriginOpen(false), 200)}
              className="pl-9 h-12"
            />
          </div>
          {originOpen && filteredOrigins.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-64 overflow-y-auto rounded-lg border bg-white shadow-lg">
              {filteredOrigins.map((a) => (
                <button
                  key={a.code}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                  onClick={() => {
                    setOrigin(a.city);
                    setOriginOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{a.city}, {a.country}</p>
                      <p className="text-xs text-muted-foreground">{a.name}</p>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{a.code}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap button */}
        <div className="hidden lg:flex items-end pb-1">
          <button
            type="button"
            onClick={swapLocations}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white hover:bg-accent transition-colors"
          >
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Destination */}
        <div className="relative">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="City or airport"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setDestOpen(true);
              }}
              onFocus={() => setDestOpen(true)}
              onBlur={() => setTimeout(() => setDestOpen(false), 200)}
              className="pl-9 h-12"
            />
          </div>
          {destOpen && filteredDests.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-64 overflow-y-auto rounded-lg border bg-white shadow-lg">
              {filteredDests.map((a) => (
                <button
                  key={a.code}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                  onClick={() => {
                    setDestination(a.city);
                    setDestOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{a.city}, {a.country}</p>
                      <p className="text-xs text-muted-foreground">{a.name}</p>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{a.code}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Depart Date */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Depart</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={departDate}
              min={today}
              onChange={(e) => setDepartDate(e.target.value)}
              className="pl-9 h-12"
            />
          </div>
        </div>

        {/* Return Date */}
        {tripType === "roundtrip" ? (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Return</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={returnDate}
                min={departDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="pl-9 h-12"
              />
            </div>
          </div>
        ) : (
          <div className="hidden lg:block" />
        )}

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
