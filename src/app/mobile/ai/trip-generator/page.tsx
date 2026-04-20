"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Wallet,
  Clock,
  ArrowLeft,
  Share2,
  Check,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { generateMockTrip } from "@/lib/ai/mock-trip-generator";
import { GeneratedTrip } from "@/types";
import { cn } from "@/lib/utils";

const styles = ["Adventure", "Cultural", "Relaxation", "Culinary", "Wellness"];
const budgets = [
  { value: "budget", label: "Budget ($50-100/day)" },
  { value: "moderate", label: "Moderate ($100-200/day)" },
  { value: "luxury", label: "Luxury ($200-400/day)" },
];

export default function MobileTripGeneratorPage() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("7");
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "result">("form");
  const [result, setResult] = useState<GeneratedTrip | null>(null);
  const [activeDay, setActiveDay] = useState(1);

  const canGenerate = destination && days && style && budget;

  const generate = async () => {
    if (!canGenerate) return;
    setStatus("loading");
    const trip = await generateMockTrip({
      destination,
      days: Number(days),
      style,
      budget,
    });
    setResult(trip);
    setActiveDay(1);
    setStatus("result");
  };

  const reset = () => {
    setStatus("form");
    setResult(null);
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
        <MobileHeader title="Generating..." showBack={false} />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="relative">
            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h2 className="mt-5 text-xl font-bold">Crafting your trip</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-[260px]">
            Analyzing your preferences and curating the perfect itinerary...
          </p>
          <div className="mt-6 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-primary/60 animate-[bounce-dot_1.4s_infinite_ease-in-out]"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === "result" && result) {
    const day = result.days.find((d) => d.dayNumber === activeDay);
    return (
      <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
        {/* Hero */}
        <div className="relative h-56 w-full">
          <Image
            src={result.coverImage}
            alt={result.title}
            fill
            className="object-cover"
            sizes="400px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 md:pt-14">
            <button
              onClick={reset}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md">
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Title */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <Badge className="bg-primary text-white border-0 text-[10px] mb-2">
              <Sparkles className="h-2.5 w-2.5 mr-0.5" />
              AI Generated
            </Badge>
            <h1 className="text-xl font-extrabold leading-tight">
              {result.title}
            </h1>
            <p className="text-xs text-white/80 mt-0.5">{result.subtitle}</p>
          </div>
        </div>

        {/* Day tabs */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide px-4 py-2">
            {result.days.map((d) => (
              <button
                key={d.dayNumber}
                onClick={() => setActiveDay(d.dayNumber)}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  activeDay === d.dayNumber
                    ? "bg-primary text-white"
                    : "text-muted-foreground"
                )}
              >
                Day {d.dayNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Day content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {day && (
            <>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Day {day.dayNumber}
                </p>
                <h2 className="text-base font-bold mt-0.5">{day.theme}</h2>
              </div>

              {day.activities.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl bg-white border p-3.5"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold text-primary">
                      {a.time}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] shrink-0"
                    >
                      ${a.estimatedCost}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm leading-tight">{a.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {a.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {a.location}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {a.duration}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Cost + tips */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-violet-50 border border-primary/10 p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">
                  Total estimated cost
                </span>
              </div>
              <p className="text-lg font-bold">
                ${result.totalEstimatedCost.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-bold">Travel tips</span>
            </div>
            <ul className="space-y-1.5">
              {result.tips.slice(0, 3).map((tip, i) => (
                <li
                  key={i}
                  className="text-[11px] text-muted-foreground flex items-start gap-1.5"
                >
                  <span className="text-primary">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="sticky bottom-0 bg-white border-t p-3 md:pb-8 flex gap-2">
          <Button variant="outline" className="flex-1 h-11" onClick={reset}>
            Regenerate
          </Button>
          <Button className="flex-1 h-11" asChild>
            <Link href="/mobile/search/trips">
              Find matching trips
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="AI Trip Generator" />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-primary p-5 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm mb-3">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold leading-tight">
            Your perfect trip, powered by AI
          </h2>
          <p className="text-xs text-white/80 mt-1">
            Answer a few questions and get a custom day-by-day itinerary in seconds.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Where do you want to go?</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g., Bali, Japan, Italy..."
                className="pl-9 h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">How many days?</Label>
              <Select value={days} onValueChange={(v) => v && setDays(v)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10, 14].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Budget</Label>
              <Select value={budget} onValueChange={(v) => v && setBudget(v)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pick one" />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map((b) => (
                    <SelectItem key={b.value} value={b.value}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Travel style</Label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    style === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/30"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t p-4 md:pb-8">
        <Button
          className="w-full h-12 gap-2"
          size="lg"
          disabled={!canGenerate}
          onClick={generate}
        >
          <Sparkles className="h-4 w-4" />
          Generate my trip
        </Button>
      </div>
    </div>
  );
}
