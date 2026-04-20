"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Check,
  Upload,
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  ListChecks,
  Camera,
  Plus,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  defaultIncluded,
  defaultNotIncluded,
  tripCategories,
} from "@/data/partner-trips";
import { cn } from "@/lib/utils";

const steps = [
  { num: 1, title: "Basics", icon: Compass },
  { num: 2, title: "Dates & Group", icon: Calendar },
  { num: 3, title: "Itinerary", icon: MapPin },
  { num: 4, title: "What's Included", icon: ListChecks },
  { num: 5, title: "Photos", icon: Camera },
  { num: 6, title: "Pricing", icon: DollarSign },
  { num: 7, title: "Review", icon: Check },
];

interface ItineraryDay {
  id: string;
  title: string;
  description: string;
  activities: string[];
}

export default function NewTripPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 — Basics
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("Easy");

  // Step 2 — Dates & group
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 37 * 86400000).toISOString().split("T")[0]
  );
  const [maxGroupSize, setMaxGroupSize] = useState(12);

  // Step 3 — Itinerary + highlights
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    { id: "d1", title: "Day 1 — Arrival", description: "", activities: [""] },
  ]);

  // Step 4 — Included / Not included
  const [included, setIncluded] = useState<string[]>([
    "Accommodation",
    "Daily breakfast",
    "All activities listed in itinerary",
    "Local guide",
  ]);
  const [notIncluded, setNotIncluded] = useState<string[]>([
    "International flights",
    "Travel insurance",
    "Personal expenses",
  ]);
  const [customIncluded, setCustomIncluded] = useState("");
  const [customNotIncluded, setCustomNotIncluded] = useState("");

  // Step 6 — Pricing
  const [price, setPrice] = useState(1999);

  const duration = Math.max(
    1,
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const canNext = () => {
    if (step === 1)
      return title && destination && country && description && categories.length > 0;
    if (step === 2) return startDate && endDate && maxGroupSize > 0;
    if (step === 3) return itinerary.every((d) => d.title && d.description);
    if (step === 4) return included.length > 0;
    if (step === 6) return price > 0;
    return true;
  };

  // Helpers
  const toggleCategory = (c: string) => {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const addHighlight = () => setHighlights([...highlights, ""]);
  const removeHighlight = (i: number) =>
    setHighlights(highlights.filter((_, idx) => idx !== i));
  const updateHighlight = (i: number, value: string) => {
    const next = [...highlights];
    next[i] = value;
    setHighlights(next);
  };

  const addDay = () => {
    setItinerary([
      ...itinerary,
      {
        id: `d${itinerary.length + 1}`,
        title: `Day ${itinerary.length + 1}`,
        description: "",
        activities: [""],
      },
    ]);
  };
  const removeDay = (id: string) =>
    setItinerary(itinerary.filter((d) => d.id !== id));
  const updateDay = (id: string, field: keyof ItineraryDay, value: any) => {
    setItinerary(
      itinerary.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const moveDay = (id: string, direction: "up" | "down") => {
    const idx = itinerary.findIndex((d) => d.id === id);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= itinerary.length) return;
    const next = [...itinerary];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setItinerary(next);
  };

  const addIncluded = () => {
    if (!customIncluded.trim()) return;
    setIncluded([...included, customIncluded.trim()]);
    setCustomIncluded("");
  };
  const addNotIncluded = () => {
    if (!customNotIncluded.trim()) return;
    setNotIncluded([...notIncluded, customNotIncluded.trim()]);
    setCustomNotIncluded("");
  };

  const togglePresetIncluded = (item: string) => {
    setIncluded((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };
  const togglePresetNotIncluded = (item: string) => {
    setNotIncluded((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleCreate = (asDraft = false) => {
    router.push("/partner/trips");
  };

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-4 gap-1.5 -ml-3 text-muted-foreground"
        >
          <Link href="/partner/trips">
            <ChevronLeft className="h-4 w-4" />
            Back to trips
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Create a new trip
        </h1>
        <p className="mt-1 text-muted-foreground">
          Build your group adventure in {steps.length} easy steps
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        {/* Steps sidebar */}
        <aside>
          <div className="space-y-1 sticky top-24">
            {steps.map((s) => {
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => isDone && setStep(s.num)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-colors",
                    isActive && "bg-primary/10 text-primary font-medium",
                    !isActive && !isDone && "text-muted-foreground cursor-default",
                    isDone && "text-foreground hover:bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full shrink-0 text-xs font-semibold",
                      isActive && "bg-primary text-white",
                      isDone && "bg-emerald-500 text-white",
                      !isActive && !isDone && "bg-muted"
                    )}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : s.num}
                  </div>
                  {s.title}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Form */}
        <div className="rounded-2xl border bg-white p-6 lg:p-8">
          {/* Step 1 - Basics */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Trip basics</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Start with the essentials
                </p>
              </div>

              <div className="space-y-2">
                <Label>Trip title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Coastal Wonders of Amalfi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Destination</Label>
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Amalfi Coast"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., Italy"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Short description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this trip special? What will travelers experience?"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {description.length} characters · 150-300 is ideal
                </p>
              </div>

              <div className="space-y-2">
                <Label>Categories (pick at least one)</Label>
                <div className="flex flex-wrap gap-2">
                  {tripCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCategory(c)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        categories.includes(c)
                          ? "border-primary bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "Easy", desc: "Light walking, no strenuous activity" },
                    { value: "Moderate", desc: "Some hiking, good fitness needed" },
                    { value: "Challenging", desc: "Serious treks, high fitness" },
                  ].map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-all",
                        difficulty === d.value
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/30"
                      )}
                    >
                      <p className="font-semibold text-sm">{d.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {d.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Dates & Group */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Dates & group size</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  When is the trip, and how many travelers?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                <p className="text-sm">
                  <span className="font-semibold">Trip duration:</span>{" "}
                  {duration} days
                </p>
              </div>

              <div className="space-y-2">
                <Label>Maximum group size</Label>
                <Input
                  type="number"
                  value={maxGroupSize}
                  min={2}
                  max={30}
                  onChange={(e) => setMaxGroupSize(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Smaller groups = more personal. Recommended: 8-14 travelers.
                </p>
              </div>
            </div>
          )}

          {/* Step 3 - Itinerary */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">Itinerary & highlights</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Day-by-day breakdown + key highlights
                </p>
              </div>

              {/* Highlights */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Trip highlights</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addHighlight}
                    className="gap-1 text-xs h-7"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary shrink-0" />
                      <Input
                        value={h}
                        onChange={(e) => updateHighlight(i, e.target.value)}
                        placeholder="e.g., Sunset boat tour along the coast"
                      />
                      {highlights.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => removeHighlight(i)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Itinerary */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Day-by-day itinerary</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addDay}
                    className="gap-1 text-xs h-7"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add day
                  </Button>
                </div>
                <div className="space-y-4">
                  {itinerary.map((day, idx) => (
                    <div key={day.id} className="rounded-xl border p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {idx + 1}
                          </span>
                          <Input
                            value={day.title}
                            onChange={(e) =>
                              updateDay(day.id, "title", e.target.value)
                            }
                            placeholder={`Day ${idx + 1} — Arrival`}
                            className="font-semibold"
                          />
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={idx === 0}
                            onClick={() => moveDay(day.id, "up")}
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={idx === itinerary.length - 1}
                            onClick={() => moveDay(day.id, "down")}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                          {itinerary.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500"
                              onClick={() => removeDay(day.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <Textarea
                        value={day.description}
                        onChange={(e) =>
                          updateDay(day.id, "description", e.target.value)
                        }
                        placeholder="Describe what this day looks like..."
                        rows={2}
                        className="text-sm"
                      />

                      <div>
                        <Label className="text-xs mb-2 block">Activities</Label>
                        <div className="space-y-1.5">
                          {day.activities.map((a, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
                              <Input
                                value={a}
                                onChange={(e) => {
                                  const next = [...day.activities];
                                  next[i] = e.target.value;
                                  updateDay(day.id, "activities", next);
                                }}
                                placeholder="e.g., Airport transfer"
                                className="h-8 text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={() => {
                                  updateDay(
                                    day.id,
                                    "activities",
                                    day.activities.filter((_, idx) => idx !== i)
                                  );
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs h-7 ml-3"
                            onClick={() =>
                              updateDay(day.id, "activities", [
                                ...day.activities,
                                "",
                              ])
                            }
                          >
                            <Plus className="h-3 w-3" />
                            Add activity
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 - Included / Not Included */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">What&apos;s included</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Tell travelers exactly what they&apos;re getting
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Included */}
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold">What&apos;s included</h3>
                      <p className="text-xs text-muted-foreground">
                        {included.length} items
                      </p>
                    </div>
                  </div>

                  {/* Preset */}
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Common items
                  </p>
                  <div className="space-y-2 mb-4">
                    {defaultIncluded.map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={included.includes(item)}
                          onCheckedChange={() => togglePresetIncluded(item)}
                        />
                        <span className="flex-1">{item}</span>
                      </label>
                    ))}
                  </div>

                  {/* Selected custom items */}
                  {included.filter((i) => !defaultIncluded.includes(i)).length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                        Custom items
                      </p>
                      <div className="space-y-1.5 mb-4">
                        {included
                          .filter((i) => !defaultIncluded.includes(i))
                          .map((item) => (
                            <div
                              key={item}
                              className="flex items-center gap-2 rounded-lg bg-white border px-3 py-2"
                            >
                              <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="text-sm flex-1">{item}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() =>
                                  setIncluded(included.filter((i) => i !== item))
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </>
                  )}

                  {/* Add custom */}
                  <div className="flex gap-2">
                    <Input
                      value={customIncluded}
                      onChange={(e) => setCustomIncluded(e.target.value)}
                      placeholder="Add custom item..."
                      className="h-9 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addIncluded();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addIncluded}
                      disabled={!customIncluded.trim()}
                      className="h-9"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Not Included */}
                <div className="rounded-xl border-2 border-red-200 bg-red-50/30 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500">
                      <X className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold">Not included</h3>
                      <p className="text-xs text-muted-foreground">
                        {notIncluded.length} items
                      </p>
                    </div>
                  </div>

                  {/* Preset */}
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Common exclusions
                  </p>
                  <div className="space-y-2 mb-4">
                    {defaultNotIncluded.map((item) => (
                      <label
                        key={item}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={notIncluded.includes(item)}
                          onCheckedChange={() => togglePresetNotIncluded(item)}
                        />
                        <span className="flex-1">{item}</span>
                      </label>
                    ))}
                  </div>

                  {/* Custom */}
                  {notIncluded.filter((i) => !defaultNotIncluded.includes(i))
                    .length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                        Custom exclusions
                      </p>
                      <div className="space-y-1.5 mb-4">
                        {notIncluded
                          .filter((i) => !defaultNotIncluded.includes(i))
                          .map((item) => (
                            <div
                              key={item}
                              className="flex items-center gap-2 rounded-lg bg-white border px-3 py-2"
                            >
                              <X className="h-3.5 w-3.5 text-red-600 shrink-0" />
                              <span className="text-sm flex-1">{item}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() =>
                                  setNotIncluded(
                                    notIncluded.filter((i) => i !== item)
                                  )
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={customNotIncluded}
                      onChange={(e) => setCustomNotIncluded(e.target.value)}
                      placeholder="Add custom exclusion..."
                      className="h-9 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addNotIncluded();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addNotIncluded}
                      disabled={!customNotIncluded.trim()}
                      className="h-9"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
                <p className="font-medium mb-1">💡 Transparency tip</p>
                <p className="text-xs">
                  Being clear about what&apos;s included builds trust and reduces
                  guest complaints. Don&apos;t hide fees or surprise add-ons.
                </p>
              </div>
            </div>
          )}

          {/* Step 5 - Photos */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Photos</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Great photos are the #1 reason travelers book
                </p>
              </div>

              <div>
                <Label className="mb-2 block">Cover photo</Label>
                <button className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
                  <Upload className="h-6 w-6" />
                  <p className="text-sm font-medium">
                    Click to upload cover photo
                  </p>
                  <p className="text-xs">JPG or PNG · Landscape 16:9 preferred</p>
                </button>
              </div>

              <div>
                <Label className="mb-2 block">Gallery photos (up to 8)</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <button
                      key={i}
                      className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Upload className="h-5 w-5" />
                      <span className="text-xs font-medium">Add</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Add photos from different parts of the trip — scenery,
                  activities, food, accommodations.
                </p>
              </div>
            </div>
          )}

          {/* Step 6 - Pricing */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Pricing</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Set your price per traveler
                </p>
              </div>

              <div className="space-y-2">
                <Label>Price per person (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="pl-8 h-14 text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Similar {difficulty.toLowerCase()} trips in {country || "your area"} charge $1,500-$3,500
                </p>
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/10 p-5">
                <p className="text-sm font-semibold mb-4">
                  Your potential earnings
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">If 50% full</p>
                    <p className="text-lg font-bold">
                      $
                      {Math.round(
                        price * Math.ceil(maxGroupSize / 2) * 0.85
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">If 75% full</p>
                    <p className="text-lg font-bold">
                      $
                      {Math.round(
                        price * Math.ceil(maxGroupSize * 0.75) * 0.85
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">If sold out</p>
                    <p className="text-lg font-bold text-primary">
                      $
                      {Math.round(price * maxGroupSize * 0.85).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  After 15% platform commission · per trip
                </p>
              </div>
            </div>
          )}

          {/* Step 7 - Review */}
          {step === 7 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Review & publish</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Take one last look before going live
                </p>
              </div>

              <div className="rounded-xl border p-4 space-y-4">
                {/* Basics */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Trip title
                  </p>
                  <p className="font-bold">{title || "—"}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {destination}, {country}
                  </p>
                </div>

                <div className="border-t pt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold">{duration} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Group size</p>
                    <p className="font-semibold">Max {maxGroupSize}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Difficulty</p>
                    <p className="font-semibold">{difficulty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-semibold">${price}</p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => (
                      <Badge key={c} variant="secondary">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Included
                    </p>
                    <p className="text-sm">{included.length} items</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Not included
                    </p>
                    <p className="text-sm">{notIncluded.length} items</p>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Itinerary
                  </p>
                  <p className="text-sm">{itinerary.length} days planned</p>
                </div>
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                <p className="text-sm">
                  <span className="font-semibold">Ready to go live?</span> Once
                  published, travelers can book immediately. You can always
                  save as draft and publish later.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Back
            </Button>
            {step < steps.length ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
                Continue
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleCreate(true)}>
                  Save as draft
                </Button>
                <Button onClick={() => handleCreate(false)}>
                  Publish trip
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
