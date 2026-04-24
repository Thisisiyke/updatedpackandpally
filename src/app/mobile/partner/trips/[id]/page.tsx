"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MapPin,
  Users,
  Star,
  Check,
  Save,
  Plus,
  X,
  DollarSign,
  ImagePlus,
  Mountain,
  ClipboardList,
  Tag,
  Trash2,
  Sparkles,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { PartnerTripTabs } from "@/components/mobile/partner-trip-tabs";
import { AiSurveyCard } from "@/components/partner/ai-survey-card";
import { generatePartnerTrip } from "@/lib/ai/partner-trip-generator";
import {
  partnerTrips,
  tripCategories,
  type PartnerTrip,
} from "@/data/partner-trips";
import {
  getUserPartnerTrips,
  saveUserPartnerTrip,
  subscribeToUserPartnerTrips,
} from "@/lib/user-partner-trips";
import { CURRENT_PARTNER } from "@/data/conversations";
import { cn } from "@/lib/utils";

type Difficulty = "Easy" | "Moderate" | "Challenging";
type TripStatus = "published" | "draft" | "sold-out";
type ItineraryDay = PartnerTrip["itinerary"][number];

function findTripById(id: string): PartnerTrip | null {
  const userTrips = getUserPartnerTrips();
  return (
    userTrips.find((t) => t.id === id) ||
    partnerTrips.find((t) => t.id === id) ||
    null
  );
}

export default function MobilePartnerTripOverview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [initial, setInitial] = useState<PartnerTrip | null>(null);

  // Basics
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");

  // Trip details
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("Moderate");
  const [maxGroupSize, setMaxGroupSize] = useState(10);

  // Status + pricing
  const [status, setStatus] = useState<TripStatus>("published");
  const [price, setPrice] = useState(0);
  const [taxRatePct, setTaxRatePct] = useState("8.25");
  const [useTieredPricing, setUseTieredPricing] = useState(false);
  const [priceSolo, setPriceSolo] = useState(0);
  const [priceCouple, setPriceCouple] = useState(0);
  const [priceGroupOf3, setPriceGroupOf3] = useState(0);

  // Itinerary
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  // Included / not included
  const [highlights, setHighlights] = useState<string[]>([]);
  const [included, setIncluded] = useState<string[]>([]);
  const [notIncluded, setNotIncluded] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");
  const [newIncluded, setNewIncluded] = useState("");
  const [newNotIncluded, setNewNotIncluded] = useState("");

  const [savedToast, setSavedToast] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenToast, setRegenToast] = useState(false);

  const handleAIRegenerate = async () => {
    if (regenerating) return;
    if (
      !confirm(
        "Replace itinerary, highlights, and inclusions with AI suggestions? Your title, description, pricing, and cover photo stay untouched."
      )
    ) {
      return;
    }
    setRegenerating(true);
    try {
      const result = await generatePartnerTrip({
        destination: initial?.destination || "",
        country: initial?.country || "",
        durationDays: initial?.durationDays || 7,
        difficulty,
        categories,
        maxGroupSize,
      });
      setItinerary(
        result.itinerary.map((d, i) => ({
          day: i + 1,
          title: d.title,
          description: d.description,
          activities: d.activities,
        }))
      );
      setHighlights(result.highlights);
      setIncluded(result.included);
      setNotIncluded(result.notIncluded);
      setRegenToast(true);
      setTimeout(() => setRegenToast(false), 2800);
    } finally {
      setRegenerating(false);
    }
  };

  useEffect(() => {
    const t = findTripById(id);
    if (!t) return;
    setInitial(t);
    setTitle(t.title);
    setDescription(t.description);
    setCoverImage(t.coverImage);
    setCategories(t.category);
    setDifficulty(t.difficulty);
    setMaxGroupSize(t.maxGroupSize);
    setStatus(t.status);
    setPrice(t.price);
    setTaxRatePct(
      typeof t.taxRate === "number" ? (t.taxRate * 100).toString() : "8.25"
    );
    if (t.priceTiers) {
      setUseTieredPricing(true);
      setPriceSolo(t.priceTiers.solo);
      setPriceCouple(t.priceTiers.couple);
      setPriceGroupOf3(t.priceTiers.groupOf3);
    } else {
      setUseTieredPricing(false);
      setPriceSolo(t.price);
      setPriceCouple(Math.round(t.price * 0.95));
      setPriceGroupOf3(Math.round(t.price * 0.9));
    }
    setItinerary(t.itinerary);
    setHighlights(t.highlights);
    setIncluded(t.included);
    setNotIncluded(t.notIncluded);
    return subscribeToUserPartnerTrips(() => {
      const fresh = findTripById(id);
      if (fresh) setInitial(fresh);
    });
  }, [id]);

  const dirty = useMemo(() => {
    if (!initial) return false;
    const initialTaxRate = initial.taxRate ?? 0.0825;
    const initialTiers = initial.priceTiers ?? null;
    const currentTiers = useTieredPricing
      ? { solo: priceSolo, couple: priceCouple, groupOf3: priceGroupOf3 }
      : null;
    return (
      title !== initial.title ||
      description !== initial.description ||
      coverImage !== initial.coverImage ||
      JSON.stringify(categories) !== JSON.stringify(initial.category) ||
      difficulty !== initial.difficulty ||
      maxGroupSize !== initial.maxGroupSize ||
      status !== initial.status ||
      price !== initial.price ||
      Number(taxRatePct) / 100 !== initialTaxRate ||
      JSON.stringify(currentTiers) !== JSON.stringify(initialTiers) ||
      JSON.stringify(itinerary) !== JSON.stringify(initial.itinerary) ||
      JSON.stringify(highlights) !== JSON.stringify(initial.highlights) ||
      JSON.stringify(included) !== JSON.stringify(initial.included) ||
      JSON.stringify(notIncluded) !== JSON.stringify(initial.notIncluded)
    );
  }, [
    initial,
    title,
    description,
    coverImage,
    categories,
    difficulty,
    maxGroupSize,
    status,
    price,
    taxRatePct,
    useTieredPricing,
    priceSolo,
    priceCouple,
    priceGroupOf3,
    itinerary,
    highlights,
    included,
    notIncluded,
  ]);

  if (!initial) {
    return (
      <div className="flex flex-col h-full min-h-[844px] bg-white">
        <MobileHeader title="Trip" />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <p className="font-semibold">Trip not found</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/mobile/partner")}
            >
              Back to dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverImage(String(reader.result || ""));
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleCategory = (c: string) => {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleSave = () => {
    const next: PartnerTrip = {
      ...initial,
      title: title.trim(),
      description: description.trim(),
      coverImage,
      category: categories,
      difficulty,
      maxGroupSize,
      status,
      price,
      taxRate: Number(taxRatePct) / 100,
      priceTiers: useTieredPricing
        ? { solo: priceSolo, couple: priceCouple, groupOf3: priceGroupOf3 }
        : undefined,
      itinerary: itinerary.map((d, i) => ({ ...d, day: i + 1 })),
      highlights,
      included,
      notIncluded,
    };
    saveUserPartnerTrip(next);
    setInitial(next);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  const fillPct = maxGroupSize
    ? (initial.currentBookings / maxGroupSize) * 100
    : 0;

  const addItineraryDay = () => {
    setItinerary((prev) => [
      ...prev,
      {
        day: prev.length + 1,
        title: `Day ${prev.length + 1}`,
        description: "",
        activities: [],
      },
    ]);
    setExpandedDay(itinerary.length);
  };

  return (
    <div className="relative flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title="Trip"
        onBack={() => router.push("/mobile/partner")}
      />
      <PartnerTripTabs tripId={id} />

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Hero */}
        <div className="relative h-40 w-full">
          {coverImage && (
            <Image
              src={coverImage}
              alt={title || initial.title}
              fill
              sizes="400px"
              className="object-cover"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <Badge
              className={cn(
                "text-[10px] gap-1",
                status === "published" &&
                  "bg-emerald-100 text-emerald-800 border-emerald-200",
                status === "draft" && "bg-gray-100 text-gray-700 border-gray-200",
                status === "sold-out" &&
                  "bg-amber-100 text-amber-800 border-amber-200"
              )}
            >
              {status === "sold-out"
                ? "Sold out"
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <p className="mt-1 text-white font-bold text-base line-clamp-1">
              {title}
            </p>
            <p className="text-white/80 text-[11px] flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {initial.destination}, {initial.country}
            </p>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-white border-b">
          <StatBox
            icon={<Users className="h-3.5 w-3.5 text-primary" />}
            label="Booked"
            value={`${initial.currentBookings}/${maxGroupSize}`}
            sub={
              <div className="h-1 mt-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            }
          />
          <StatBox
            icon={<DollarSign className="h-3.5 w-3.5 text-primary" />}
            label="Revenue"
            value={`$${(initial.revenue || 0).toLocaleString()}`}
          />
          <StatBox
            icon={<Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
            label="Rating"
            value={
              initial.reviewCount > 0
                ? `${initial.rating} (${initial.reviewCount})`
                : "—"
            }
          />
        </div>

        {/* Edit cards */}
        <div className="px-5 mt-4 space-y-4">
          {/* Cover photo */}
          <EditCard title="Cover photo">
            <div className="relative h-32 w-full overflow-hidden rounded-xl bg-muted">
              {coverImage && (
                <Image
                  src={coverImage}
                  alt={title}
                  fill
                  sizes="400px"
                  className="object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group"
              >
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImagePlus className="h-3.5 w-3.5" />
                  Change
                </span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full gap-1.5 mt-2"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Upload new photo
            </Button>
          </EditCard>

          {/* Basics */}
          <EditCard title="Basics">
            <Field label="Title">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </Field>
          </EditCard>

          {/* Trip details */}
          <EditCard title="Trip details">
            <Field label="Categories">
              <div className="flex flex-wrap gap-1.5">
                {tripCategories.map((c) => {
                  const active = categories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCategory(c)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      <Tag className="inline h-2.5 w-2.5 mr-1" />
                      {c}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Difficulty">
              <div className="grid grid-cols-3 gap-2">
                {(["Easy", "Moderate", "Challenging"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "rounded-lg border py-2 text-xs font-semibold flex items-center justify-center gap-1",
                      difficulty === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <Mountain className="h-3 w-3" />
                    {d}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Max group size">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setMaxGroupSize((n) => Math.max(2, n - 1))
                  }
                  className="h-9 w-9 shrink-0"
                  type="button"
                >
                  -
                </Button>
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold">{maxGroupSize}</p>
                  <p className="text-[10px] text-muted-foreground">
                    travelers · {initial.currentBookings} booked so far
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setMaxGroupSize((n) => Math.min(50, n + 1))
                  }
                  className="h-9 w-9 shrink-0"
                  type="button"
                >
                  +
                </Button>
              </div>
              {maxGroupSize < initial.currentBookings && (
                <p className="mt-2 text-[11px] text-amber-700">
                  Below current bookings ({initial.currentBookings}) — at
                  least one traveler will be over capacity.
                </p>
              )}
            </Field>
          </EditCard>

          {/* Status */}
          <EditCard title="Status">
            <div className="grid grid-cols-3 gap-2">
              {(["published", "draft", "sold-out"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "rounded-lg border py-2 text-xs font-semibold capitalize",
                    status === s
                      ? "border-primary bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {s === "sold-out" ? "Sold out" : s}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {status === "published" && "Visible & bookable"}
              {status === "draft" && "Not visible to travelers"}
              {status === "sold-out" && "Visible but not bookable"}
            </p>
          </EditCard>

          {/* Pricing */}
          <EditCard title="Pricing">
            {/* Flat / tiered toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUseTieredPricing(false)}
                className={cn(
                  "rounded-lg border py-2 text-xs font-semibold",
                  !useTieredPricing
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                Flat price
              </button>
              <button
                type="button"
                onClick={() => setUseTieredPricing(true)}
                className={cn(
                  "rounded-lg border py-2 text-xs font-semibold",
                  useTieredPricing
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                Tiered (group rate)
              </button>
            </div>

            {!useTieredPricing ? (
              <Field label="Price per person">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="pl-7"
                  />
                </div>
              </Field>
            ) : (
              <div className="space-y-2">
                {[
                  {
                    label: "Solo",
                    hint: "1 traveler",
                    value: priceSolo,
                    setter: setPriceSolo,
                  },
                  {
                    label: "Couple",
                    hint: "2 travelers",
                    value: priceCouple,
                    setter: setPriceCouple,
                  },
                  {
                    label: "Group",
                    hint: "3+ travelers",
                    value: priceGroupOf3,
                    setter: setPriceGroupOf3,
                  },
                ].map((tier) => (
                  <div
                    key={tier.label}
                    className="flex items-center gap-3 rounded-lg border p-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{tier.label}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {tier.hint}
                      </p>
                    </div>
                    <div className="relative w-28 shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        value={tier.value}
                        onChange={(e) =>
                          tier.setter(Number(e.target.value))
                        }
                        className="pl-7 h-9 text-right font-semibold"
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground">
                  Lower per-person rate auto-applies as the group grows.
                </p>
              </div>
            )}

            <Field label="Tax rate">
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={30}
                  step={0.01}
                  value={taxRatePct}
                  onChange={(e) => setTaxRatePct(e.target.value)}
                  className="pr-8 text-right font-semibold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Plus Pack &amp; Pally&apos;s 6% platform fee, applied
                automatically.
              </p>
            </Field>
          </EditCard>

          {/* Itinerary */}
          <EditCard
            title="Itinerary"
            right={
              <span className="text-[11px] text-muted-foreground">
                {itinerary.length} day{itinerary.length === 1 ? "" : "s"}
              </span>
            }
          >
            <div className="space-y-2">
              {itinerary.map((day, i) => {
                const expanded = expandedDay === i;
                return (
                  <div
                    key={i}
                    className="rounded-xl border bg-muted/20"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedDay(expanded ? null : i)}
                      className="flex w-full items-center justify-between gap-2 p-3 text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary shrink-0">
                          {i + 1}
                        </span>
                        <p className="text-xs font-semibold truncate">
                          {day.title || `Day ${i + 1}`}
                        </p>
                      </div>
                      {expanded ? (
                        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>

                    {expanded && (
                      <div className="px-3 pb-3 space-y-2 border-t bg-white">
                        <div className="pt-3">
                          <Label className="text-[10px]">Day title</Label>
                          <Input
                            value={day.title}
                            onChange={(e) =>
                              setItinerary((prev) =>
                                prev.map((d, idx) =>
                                  idx === i
                                    ? { ...d, title: e.target.value }
                                    : d
                                )
                              )
                            }
                            className="mt-1 h-9 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px]">Description</Label>
                          <textarea
                            value={day.description}
                            onChange={(e) =>
                              setItinerary((prev) =>
                                prev.map((d, idx) =>
                                  idx === i
                                    ? { ...d, description: e.target.value }
                                    : d
                                )
                              )
                            }
                            rows={2}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        </div>
                        <ActivityChips
                          activities={day.activities}
                          onChange={(next) =>
                            setItinerary((prev) =>
                              prev.map((d, idx) =>
                                idx === i ? { ...d, activities: next } : d
                              )
                            )
                          }
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedDay(null);
                            setItinerary((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            );
                          }}
                          className="flex items-center gap-1 text-[11px] text-red-600 font-medium pt-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove day
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItineraryDay}
              className="w-full gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Add day
            </Button>
          </EditCard>

          {/* Highlights */}
          <EditCard
            title="Highlights"
            right={
              <span className="text-[11px] text-muted-foreground">
                {highlights.length}
              </span>
            }
          >
            <ChipList
              items={highlights}
              onRemove={(i) =>
                setHighlights((prev) => prev.filter((_, idx) => idx !== i))
              }
            />
            <AddRow
              value={newHighlight}
              setValue={setNewHighlight}
              placeholder="Add highlight…"
              onAdd={(v) => {
                setHighlights([...highlights, v]);
                setNewHighlight("");
              }}
            />
          </EditCard>

          {/* Included / Not Included */}
          <EditCard title="What's included">
            <div className="space-y-3">
              <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-3">
                <p className="text-[11px] font-bold text-emerald-700 mb-2 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Included ({included.length})
                </p>
                <ChipList
                  items={included}
                  onRemove={(i) =>
                    setIncluded(included.filter((_, idx) => idx !== i))
                  }
                  variant="white"
                />
                <AddRow
                  value={newIncluded}
                  setValue={setNewIncluded}
                  placeholder="Add inclusion…"
                  onAdd={(v) => {
                    setIncluded([...included, v]);
                    setNewIncluded("");
                  }}
                />
              </div>
              <div className="rounded-xl border-2 border-red-200 bg-red-50/30 p-3">
                <p className="text-[11px] font-bold text-red-700 mb-2 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  Not included ({notIncluded.length})
                </p>
                <ChipList
                  items={notIncluded}
                  onRemove={(i) =>
                    setNotIncluded(notIncluded.filter((_, idx) => idx !== i))
                  }
                  variant="white"
                />
                <AddRow
                  value={newNotIncluded}
                  setValue={setNewNotIncluded}
                  placeholder="Add exclusion…"
                  onAdd={(v) => {
                    setNotIncluded([...notIncluded, v]);
                    setNewNotIncluded("");
                  }}
                />
              </div>
            </div>
          </EditCard>

          {/* AI regenerate — replaces itinerary, highlights, inclusions */}
          <button
            type="button"
            onClick={handleAIRegenerate}
            disabled={regenerating}
            className={cn(
              "w-full rounded-2xl border-2 border-dashed p-4 text-left flex items-center gap-3 transition-colors",
              regenerating
                ? "border-primary bg-primary/5"
                : regenToast
                ? "border-emerald-400 bg-emerald-50/50"
                : "border-primary/30 hover:border-primary/60"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-violet-500/15 shrink-0">
              {regenerating ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : regenToast ? (
                <Check className="h-5 w-5 text-emerald-600" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">
                {regenerating
                  ? "Rewriting with AI…"
                  : regenToast
                  ? "AI suggestions applied"
                  : "Regenerate with AI"}
              </p>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                {regenerating
                  ? "Pulling fresh itinerary, highlights, and inclusions…"
                  : regenToast
                  ? "Review the changes above and tap Save to keep them."
                  : "Replaces itinerary, highlights, and inclusions based on this trip's destination, categories, and difficulty."}
              </p>
            </div>
          </button>

          {/* AI post-trip survey */}
          <AiSurveyCard
            trip={{
              id: initial.id,
              destination: initial.destination,
              country: initial.country,
              highlights,
              difficulty,
              category: categories,
              currentBookings: initial.currentBookings,
            }}
            host={{ name: CURRENT_PARTNER.name }}
          />
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-white border-t p-3 md:pb-6 flex items-center gap-2">
        <Button variant="outline" asChild size="icon" className="h-10 w-10 shrink-0" title="Preview as traveler">
          <Link href={`/mobile/partner/trips/${id}/preview`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <Link href="/mobile/partner">
            <ChevronLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button
          onClick={handleSave}
          disabled={!dirty}
          className="flex-1 gap-1.5"
        >
          {savedToast ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function StatBox({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1">
        {icon}
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </p>
      </div>
      <p className="mt-0.5 text-sm font-bold truncate">{value}</p>
      {sub}
    </div>
  );
}

function EditCard({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-1.5">
          {title === "Itinerary" && (
            <ClipboardList className="h-3.5 w-3.5 text-primary" />
          )}
          {title}
        </h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function ChipList({
  items,
  onRemove,
  variant = "muted",
}: {
  items: string[];
  onRemove: (i: number) => void;
  variant?: "muted" | "white";
}) {
  if (items.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground italic">
        Nothing added yet.
      </p>
    );
  }
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5",
            variant === "white" ? "bg-white" : "bg-muted/30"
          )}
        >
          <span className="text-xs flex-1">{item}</span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="text-muted-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}

function AddRow({
  value,
  setValue,
  placeholder,
  onAdd,
}: {
  value: string;
  setValue: (v: string) => void;
  placeholder: string;
  onAdd: (v: string) => void;
}) {
  const submit = () => {
    const v = value.trim();
    if (v) onAdd(v);
  };
  return (
    <div className="flex gap-2 mt-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-9 text-xs"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
      />
      <Button
        type="button"
        size="sm"
        className="h-9 shrink-0 gap-1"
        onClick={submit}
        disabled={!value.trim()}
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </Button>
    </div>
  );
}

function ActivityChips({
  activities,
  onChange,
}: {
  activities: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const v = draft.trim();
    if (v) {
      onChange([...activities, v]);
      setDraft("");
    }
  };
  return (
    <div>
      <Label className="text-[10px]">Activities</Label>
      <div className="mt-1 flex flex-wrap gap-1">
        {activities.map((a, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full border bg-white px-2 py-0.5 text-[10px]"
          >
            {a}
            <button
              type="button"
              onClick={() =>
                onChange(activities.filter((_, idx) => idx !== i))
              }
              className="text-muted-foreground"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add activity…"
          className="h-8 text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          className="h-8 shrink-0 px-2 gap-0.5"
          onClick={submit}
          disabled={!draft.trim()}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
