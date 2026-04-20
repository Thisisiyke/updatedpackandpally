"use client";

import { useState } from "react";
import {
  Sparkles,
  MapPin,
  Calendar,
  Wallet,
  Compass,
  Clock,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneratedTrip } from "@/types";
import { generateMockTrip } from "@/lib/ai/mock-trip-generator";

const styles = ["Adventure", "Cultural", "Relaxation", "Culinary", "Wellness", "Photography"];
const budgets = [
  { value: "budget", label: "Budget ($50-100/day)" },
  { value: "moderate", label: "Moderate ($100-200/day)" },
  { value: "luxury", label: "Luxury ($200-400/day)" },
];

export function TripGenerator() {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("7");
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "complete">("idle");
  const [result, setResult] = useState<GeneratedTrip | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");

  const canGenerate = destination && days && style && budget;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setStatus("generating");

    const messages = [
      `Exploring ${destination}...`,
      "Curating the best activities...",
      "Building your itinerary...",
      "Estimating costs...",
      "Almost there...",
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingMsg(messages[i % messages.length]);
      i++;
    }, 700);

    const trip = await generateMockTrip({
      destination,
      days: Number(days),
      style,
      budget,
    });

    clearInterval(interval);
    setResult(trip);
    setStatus("complete");
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setDestination("");
    setDays("7");
    setStyle("");
    setBudget("");
  };

  // Generating State
  if (status === "generating") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative">
            <Sparkles className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h3 className="mt-6 text-xl font-bold">
            Crafting Your Perfect Trip
          </h3>
          <p className="mt-2 text-muted-foreground">{loadingMsg}</p>
          <Progress value={65} className="mt-6 w-64 h-2" />
        </CardContent>
      </Card>
    );
  }

  // Result State
  if (status === "complete" && result) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Hero */}
        <div
          className="relative rounded-2xl overflow-hidden h-64 bg-cover bg-center"
          style={{ backgroundImage: `url('${result.coverImage}')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <Badge className="bg-primary mb-2">AI Generated</Badge>
            <h2 className="text-2xl font-bold">{result.title}</h2>
            <p className="text-white/80">{result.subtitle}</p>
          </div>
        </div>

        {/* Day Tabs */}
        <Tabs defaultValue="1">
          <TabsList className="w-full justify-start overflow-x-auto">
            {result.days.map((day) => (
              <TabsTrigger
                key={day.dayNumber}
                value={String(day.dayNumber)}
                className="min-w-[100px]"
              >
                Day {day.dayNumber}
              </TabsTrigger>
            ))}
          </TabsList>
          {result.days.map((day) => (
            <TabsContent key={day.dayNumber} value={String(day.dayNumber)}>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold">{day.theme}</h3>
                  <div className="mt-4 space-y-4">
                    {day.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex gap-4 rounded-lg border p-4"
                      >
                        <div className="text-sm font-medium text-primary shrink-0 w-20">
                          {activity.time}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold">{activity.title}</h4>
                            <Badge variant="secondary" className="text-xs shrink-0">
                              ${activity.estimatedCost}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {activity.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Cost & Tips */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                Estimated Total Cost
              </h3>
              <p className="mt-2 text-3xl font-bold">
                ${result.totalEstimatedCost.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">per person</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Travel Tips
              </h3>
              <ul className="mt-2 space-y-1.5">
                {result.tips.slice(0, 3).map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={reset}>
            Generate New Trip
          </Button>
          <Button>Save This Itinerary</Button>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="pt-6 space-y-6">
        <div className="text-center mb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">AI Trip Generator</h2>
          <p className="mt-1 text-muted-foreground">
            Tell us your preferences and we&apos;ll create the perfect itinerary
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Where do you want to go?</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="e.g., Bali, Japan, Italy..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>How many days?</Label>
              <Select value={days} onValueChange={(v) => v && setDays(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10, 14].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} days
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Budget</Label>
              <Select value={budget} onValueChange={(v) => v && setBudget(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget" />
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

          <div className="space-y-2">
            <Label>Travel style</Label>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    style === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          className="w-full h-11 gap-2"
          disabled={!canGenerate}
          onClick={handleGenerate}
        >
          <Sparkles className="h-4 w-4" />
          Generate My Trip
        </Button>
      </CardContent>
    </Card>
  );
}
