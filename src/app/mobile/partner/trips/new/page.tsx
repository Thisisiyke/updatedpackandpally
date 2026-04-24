"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  Plus,
  X,
  Loader2,
  MapPin,
  Users,
  Mountain,
  DollarSign,
  Calendar,
  ClipboardList,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { generatePartnerTrip } from "@/lib/ai/partner-trip-generator";
import { tripCategories, type PartnerTrip } from "@/data/partner-trips";
import { saveUserPartnerTrip } from "@/lib/user-partner-trips";
import { CURRENT_PARTNER_HOST_ID } from "@/lib/host-terms";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEP_META: {
  step: Step;
  label: string;
  icon: typeof MapPin;
}[] = [
  { step: 1, label: "Basics", icon: MapPin },
  { step: 2, label: "Dates", icon: Calendar },
  { step: 3, label: "Itinerary", icon: ClipboardList },
  { step: 4, label: "Included", icon: Check },
  { step: 5, label: "Pricing", icon: DollarSign },
  { step: 6, label: "Review", icon: Sparkles },
];

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80";

export default function MobileCreateTripPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<
    "Easy" | "Moderate" | "Challenging"
  >("Moderate");
  const [categories, setCategories] = useState<string[]>(["Cultural"]);
  const [generating, setGenerating] = useState(false);

  // Step 2
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxGroupSize, setMaxGroupSize] = useState(10);

  // Step 3
  const [itinerary, setItinerary] = useState<
    { title: string; description: string; activities: string[] }[]
  >([]);

  // Step 4
  const [included, setIncluded] = useState<string[]>([
    "Accommodation",
    "Daily breakfast",
    "Expert local host",
  ]);
  const [notIncluded, setNotIncluded] = useState<string[]>([
    "International flights",
    "Travel insurance",
  ]);
  const [newIncluded, setNewIncluded] = useState("");
  const [newNotIncluded, setNewNotIncluded] = useState("");

  // Step 5
  const [price, setPrice] = useState(1999);
  const [taxRatePct, setTaxRatePct] = useState("8.25");

  // Step 6
  const [publishing, setPublishing] = useState(false);
  const [publishedId, setPublishedId] = useState<string | null>(null);

  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const d = Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return Math.max(0, d);
  }, [startDate, endDate]);

  const toggleCategory = (c: string) => {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const canContinue = (s: Step): boolean => {
    if (s === 1)
      return (
        title.trim().length >= 3 &&
        destination.trim().length >= 2 &&
        country.trim().length >= 2 &&
        description.trim().length >= 10 &&
        categories.length >= 1
      );
    if (s === 2) return !!startDate && !!endDate && maxGroupSize >= 2;
    if (s === 3) return itinerary.length > 0;
    if (s === 4) return included.length > 0;
    if (s === 5) return price > 0 && Number(taxRatePct) >= 0;
    return true;
  };

  const handleAIGenerate = async () => {
    if (!destination.trim() || !country.trim() || categories.length === 0) {
      return;
    }
    setGenerating(true);
    try {
      const result = await generatePartnerTrip({
        destination,
        country,
        durationDays: durationDays || 7,
        difficulty,
        categories,
        maxGroupSize,
      });
      if (!title.trim()) setTitle(result.title);
      if (!description.trim()) setDescription(result.description);
      setItinerary(
        result.itinerary.map((d) => ({
          title: d.title,
          description: d.description,
          activities: d.activities,
        }))
      );
      setIncluded(result.included);
      setNotIncluded(result.notIncluded);
      if (price === 1999) setPrice(result.suggestedPrice);
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 1200));

    const id = `utrip-${Date.now()}`;
    const durationForTrip = durationDays || 7;
    const newTrip: PartnerTrip = {
      id,
      title: title.trim(),
      slug: title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      destination: destination.trim(),
      country: country.trim(),
      category: categories,
      difficulty,
      coverImage: FALLBACK_COVER,
      images: [FALLBACK_COVER],
      startDate,
      endDate,
      durationDays: durationForTrip,
      price,
      taxRate: Number(taxRatePct) / 100,
      currency: "USD",
      maxGroupSize,
      currentBookings: 0,
      description: description.trim(),
      highlights: itinerary.map((d) => d.title).slice(0, 5),
      itinerary: itinerary.map((d, i) => ({
        day: i + 1,
        title: d.title,
        description: d.description,
        activities: d.activities,
      })),
      included,
      notIncluded,
      status: "published",
      revenue: 0,
      createdAt: new Date().toISOString(),
      rating: 0,
      reviewCount: 0,
    };

    saveUserPartnerTrip(newTrip);
    // Remember the host (for parity with web flow, though not strictly needed)
    void CURRENT_PARTNER_HOST_ID;
    setPublishedId(id);
    setPublishing(false);
  };

  if (publishedId) {
    return (
      <div className="flex flex-col h-full min-h-[844px] bg-gradient-to-br from-emerald-50 via-white to-primary/5">
        <MobileHeader title="Trip live" showBack={false} />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-xs animate-[fade-in-up_400ms_ease-out]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <PartyPopper className="h-7 w-7 text-emerald-600" />
            </div>
            <h2 className="mt-5 text-xl font-bold">Your trip is live</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Travelers can now discover and join {title.trim()}. Head to
              your dashboard anytime to manage it.
            </p>
            <div className="mt-6 space-y-2">
              <Button
                className="w-full"
                onClick={() => router.push("/mobile/partner")}
              >
                Back to dashboard
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/partner/trips/${publishedId}`)}
              >
                Open in web dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentMeta = STEP_META[step - 1];
  const Icon = currentMeta.icon;

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title={`Step ${step} of 6`}
        onBack={step === 1 ? undefined : () => setStep((step - 1) as Step)}
      />

      {/* Progress */}
      <div className="px-5 pt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold text-foreground">
            {currentMeta.label}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Step 1 — Basics */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold leading-tight">
                Tell us about the trip
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Start with where and what — we can draft the details for you.
              </p>
            </div>

            <Field label="Destination">
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Kyoto"
              />
            </Field>
            <Field label="Country">
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Japan"
              />
            </Field>
            <Field label="Trip title">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sacred Temples of Kyoto"
              />
            </Field>
            <Field label="Difficulty">
              <div className="grid grid-cols-3 gap-2">
                {(["Easy", "Moderate", "Challenging"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      "rounded-lg border py-2 text-xs font-semibold",
                      difficulty === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>
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
                      {c}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="What makes this trip special?"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </Field>

            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={
                generating ||
                !destination.trim() ||
                !country.trim() ||
                categories.length === 0
              }
              className={cn(
                "w-full rounded-xl border-2 border-dashed p-3 text-left flex items-center gap-3 transition-colors",
                generating
                  ? "border-primary bg-primary/5"
                  : "border-primary/30 hover:border-primary/60"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-violet-500/15 shrink-0">
                {generating ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Sparkles className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">
                  {generating ? "Drafting with AI…" : "Draft with AI"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {generating
                    ? "Writing itinerary, highlights, pricing"
                    : "Autofills itinerary, what's included, and a suggested price"}
                </p>
              </div>
              {!generating && (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>
          </div>
        )}

        {/* Step 2 — Dates */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold leading-tight">
                When is the trip?
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Pick start and end dates, plus your maximum group size.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Field>
              <Field label="End">
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Field>
            </div>

            {durationDays > 0 && (
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-sm">
                <span className="font-semibold">{durationDays} days</span>
                <span className="text-muted-foreground"> · {durationDays - 1} nights</span>
              </div>
            )}

            <Field label="Max group size">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMaxGroupSize((n) => Math.max(2, n - 1))}
                  className="h-10 w-10 shrink-0"
                >
                  -
                </Button>
                <div className="flex-1 text-center">
                  <p className="text-3xl font-bold">{maxGroupSize}</p>
                  <p className="text-[11px] text-muted-foreground">
                    travelers
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMaxGroupSize((n) => Math.min(50, n + 1))}
                  className="h-10 w-10 shrink-0"
                >
                  +
                </Button>
              </div>
            </Field>
          </div>
        )}

        {/* Step 3 — Itinerary */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold leading-tight">Itinerary</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Day-by-day plan for travelers.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setItinerary((prev) => [
                    ...prev,
                    { title: "", description: "", activities: [] },
                  ])
                }
                className="gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Add day
              </Button>
            </div>

            {itinerary.length === 0 && (
              <button
                type="button"
                onClick={() =>
                  setItinerary([
                    { title: "Arrival day", description: "", activities: [] },
                  ])
                }
                className="w-full rounded-xl border-2 border-dashed p-6 text-center"
              >
                <Plus className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-sm font-semibold">
                  Add your first day
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Or go back and try AI draft
                </p>
              </button>
            )}

            {itinerary.map((day, i) => (
              <div
                key={i}
                className="rounded-xl border bg-white p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Day {i + 1}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setItinerary((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                    className="text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  value={day.title}
                  onChange={(e) =>
                    setItinerary((prev) =>
                      prev.map((d, idx) =>
                        idx === i ? { ...d, title: e.target.value } : d
                      )
                    )
                  }
                  placeholder="Day title"
                  className="h-9"
                />
                <textarea
                  value={day.description}
                  onChange={(e) =>
                    setItinerary((prev) =>
                      prev.map((d, idx) =>
                        idx === i ? { ...d, description: e.target.value } : d
                      )
                    )
                  }
                  placeholder="What happens on this day…"
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {day.activities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {day.activities.map((a, ai) => (
                      <span
                        key={ai}
                        className="text-[10px] rounded-full bg-muted px-2 py-0.5"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 4 — Included */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold leading-tight">
                What&apos;s included?
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Help travelers see the value they get.
              </p>
            </div>

            <ItemList
              title="Included"
              color="emerald"
              items={included}
              onAdd={(v) => {
                setIncluded([...included, v]);
                setNewIncluded("");
              }}
              onRemove={(i) =>
                setIncluded(included.filter((_, idx) => idx !== i))
              }
              inputValue={newIncluded}
              setInputValue={setNewIncluded}
              placeholder="e.g. Airport transfers"
            />
            <ItemList
              title="Not included"
              color="red"
              items={notIncluded}
              onAdd={(v) => {
                setNotIncluded([...notIncluded, v]);
                setNewNotIncluded("");
              }}
              onRemove={(i) =>
                setNotIncluded(notIncluded.filter((_, idx) => idx !== i))
              }
              inputValue={newNotIncluded}
              setInputValue={setNewNotIncluded}
              placeholder="e.g. Travel insurance"
            />
          </div>
        )}

        {/* Step 5 — Pricing */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold leading-tight">Set your price</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Per person, in USD. Tax is applied at checkout.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <Label className="text-xs">Price per person</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="pl-7 text-2xl font-bold h-14"
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Earnings for a full trip of {maxGroupSize} people:{" "}
                <span className="font-bold text-foreground">
                  ${(price * maxGroupSize).toLocaleString()}
                </span>
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-4">
              <Label className="text-xs">Tax rate</Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  min={0}
                  max={30}
                  step={0.01}
                  value={taxRatePct}
                  onChange={(e) => setTaxRatePct(e.target.value)}
                  className="pr-8 font-semibold text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Pack &amp; Pally&apos;s 6% platform fee is added automatically.
              </p>
            </div>
          </div>
        )}

        {/* Step 6 — Review */}
        {step === 6 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold leading-tight">Review & publish</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Once live, travelers can discover and join this trip.
              </p>
            </div>

            <div className="rounded-2xl border bg-white overflow-hidden">
              <div className="relative h-36 w-full">
                <Image
                  src={FALLBACK_COVER}
                  alt={title}
                  fill
                  sizes="400px"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-primary">
                  {categories.join(" · ")}
                </p>
                <h3 className="mt-1 font-bold text-base">{title}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {destination}, {country}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    – {durationDays}d
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Up to {maxGroupSize}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mountain className="h-3 w-3" />
                    {difficulty}
                  </span>
                </p>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {description}
                </p>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      Per person
                    </p>
                    <p className="font-bold text-lg">
                      ${price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">
                      Tax rate
                    </p>
                    <p className="font-semibold text-sm">{taxRatePct}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-muted/30 border p-3 text-[11px] text-muted-foreground space-y-1">
              <p>
                <span className="font-semibold text-foreground">
                  {itinerary.length} days
                </span>{" "}
                of itinerary drafted.
              </p>
              <p>
                <span className="font-semibold text-foreground">
                  {included.length}
                </span>{" "}
                inclusions ·{" "}
                <span className="font-semibold text-foreground">
                  {notIncluded.length}
                </span>{" "}
                exclusions listed.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 bg-white border-t p-4 md:pb-8 flex items-center gap-2">
        {step > 1 && (
          <Button
            variant="outline"
            onClick={() => setStep((step - 1) as Step)}
            className="flex-1"
            disabled={publishing}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        {step < 6 ? (
          <Button
            onClick={() => setStep((step + 1) as Step)}
            disabled={!canContinue(step)}
            className="flex-1 gap-1.5"
            size="lg"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handlePublish}
            disabled={publishing}
            className="flex-1 gap-1.5"
            size="lg"
          >
            {publishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Publish trip
              </>
            )}
          </Button>
        )}
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

function ItemList({
  title,
  color,
  items,
  onAdd,
  onRemove,
  inputValue,
  setInputValue,
  placeholder,
}: {
  title: string;
  color: "emerald" | "red";
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  placeholder: string;
}) {
  const submit = () => {
    const v = inputValue.trim();
    if (v) onAdd(v);
  };
  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-3",
        color === "emerald"
          ? "border-emerald-200 bg-emerald-50/30"
          : "border-red-200 bg-red-50/30"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full",
            color === "emerald" ? "bg-emerald-500" : "bg-red-500"
          )}
        >
          {color === "emerald" ? (
            <Check className="h-3.5 w-3.5 text-white" />
          ) : (
            <X className="h-3.5 w-3.5 text-white" />
          )}
        </div>
        <p className="font-bold text-sm">
          {title} ({items.length})
        </p>
      </div>
      <div className="space-y-1.5 mb-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg bg-white border px-3 py-1.5"
          >
            <span className="text-xs flex-1">{item}</span>
            <button onClick={() => onRemove(i)} className="text-muted-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
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
          size="sm"
          className="h-9 shrink-0"
          onClick={submit}
          disabled={!inputValue.trim()}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
