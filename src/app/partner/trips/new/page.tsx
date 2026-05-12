"use client";

import { useEffect, useState } from "react";
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
  Wand2,
  Copy,
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
import { AiTripModal } from "@/components/partner/ai-trip-modal";
import { getHostDefaults } from "@/lib/host-defaults";
import { cn } from "@/lib/utils";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import {
  validateWanderlyTripDescription,
  validateWanderlyTripName,
  WANDERLY_TRIP_NAME_HINT,
} from "@/lib/wanderly-trip-validation";
import { hostNeedsStripeConnect } from "@/lib/host-needs-stripe-connect";
import { StripeRequiredForCreate } from "@/components/partner/stripe-required-for-create";
import { DestinationPlaceField } from "@/components/partner/destination-place-field";
import { PartialPaymentCard } from "@/components/partner/partial-payment-card";
import type { CustomSplit, PaymentSchedule } from "@/lib/installment-schedule";
import type { Trip } from "@/types";

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

/** Match Wanderly DD/MM/YYYY without shifting calendar day (avoid UTC parsing of YYYY-MM-DD). */
function formatIsoToDDMMYYYY(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${d}/${mo}/${y}`;
}

export default function NewTripPage() {
  const router = useRouter();
  const { user: packUser } = usePackPallyAuth();
  const [step, setStep] = useState(1);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  // Step 1 — Basics
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  /** Locality from Google Places (Wanderly `city` field). */
  const [resolvedCity, setResolvedCity] = useState("");
  const [placeLat, setPlaceLat] = useState<number | null>(null);
  const [placeLng, setPlaceLng] = useState<number | null>(null);
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
  const [closeJoinDate, setCloseJoinDate] = useState("");
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
  const [useTieredPricing, setUseTieredPricing] = useState(false);
  const [priceSolo, setPriceSolo] = useState(2499);
  const [priceCouple, setPriceCouple] = useState(2199);
  const [priceGroupOf3, setPriceGroupOf3] = useState(1899);
  const [taxRatePct, setTaxRatePct] = useState("8.25"); // percent; stored as decimal on save
  const [installmentsEnabled, setInstallmentsEnabled] = useState(false);
  const [paymentSchedule, setPaymentSchedule] =
    useState<PaymentSchedule>("biweekly");
  const [paymentCustomSplits, setPaymentCustomSplits] = useState<CustomSplit[]>(
    []
  );

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [duplicateFromId, setDuplicateFromId] = useState<string | null>(null);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [duplicateReady, setDuplicateReady] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");

  useEffect(() => {
    setDuplicateFromId(
      new URLSearchParams(window.location.search).get("duplicate")
    );
    // Pre-fill from host-level defaults (Settings → Trip defaults).
    const d = getHostDefaults();
    if (typeof d.taxRate === "number") {
      setTaxRatePct(String(Math.round(d.taxRate * 10000) / 100));
    }
  }, []);

  useEffect(() => {
    if (!duplicateFromId) return;
    let cancelled = false;
    setDuplicateLoading(true);
    setDuplicateError("");
    fetch(`/api/trips/${encodeURIComponent(duplicateFromId)}`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load"))))
      .then((d: { trip?: Trip }) => {
        if (cancelled || !d.trip) {
          if (!cancelled) setDuplicateError("Could not load trip to copy.");
          return;
        }
        const trip = d.trip;
        setTitle(`${trip.title} (Copy)`);
        setDestination(trip.destination);
        setCountry(trip.country);
        setDescription(trip.description);
        setCategories(
          trip.category.length > 0 ? [...trip.category] : ["Adventure"]
        );
        setDifficulty(trip.difficulty);

        const start = trip.startDate.slice(0, 10);
        const end = trip.endDate.slice(0, 10);
        setStartDate(start);
        setEndDate(end >= start ? end : start);
        setCloseJoinDate(trip.closeJoinDate?.slice(0, 10) || "");

        setMaxGroupSize(Math.max(1, trip.maxGroupSize));

        const tripDur = Math.max(
          1,
          Math.round(
            (new Date(trip.endDate).getTime() -
              new Date(trip.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );
        const srcDays = trip.itinerary || [];
        const dayRows: ItineraryDay[] = [];
        for (let i = 0; i < tripDur; i++) {
          const src = srcDays[i];
          dayRows.push({
            id: `d${i + 1}-${Date.now()}-${i}`,
            title: src?.title?.trim() || `Day ${i + 1}`,
            description:
              src?.description?.trim() || "See day plan and inclusions.",
            activities:
              src?.activities && src.activities.length > 0
                ? [...src.activities]
                : [""],
          });
        }
        setItinerary(
          dayRows.length > 0
            ? dayRows
            : [
                {
                  id: "d1",
                  title: "Day 1",
                  description: "",
                  activities: [""],
                },
              ]
        );

        if (trip.highlights.length) {
          setHighlights(trip.highlights.map((h) => h));
        } else {
          setHighlights([""]);
        }

        if (trip.included.length) {
          setIncluded([...trip.included]);
        } else {
          setIncluded([...defaultIncluded]);
        }
        if (trip.notIncluded.length) {
          setNotIncluded([...trip.notIncluded]);
        } else {
          setNotIncluded([...defaultNotIncluded]);
        }

        if (trip.priceTiers) {
          setUseTieredPricing(true);
          setPriceSolo(trip.priceTiers.solo);
          setPriceCouple(trip.priceTiers.couple);
          setPriceGroupOf3(trip.priceTiers.groupOf3);
        } else {
          setUseTieredPricing(false);
          setPrice(Math.max(0, Math.round(trip.price)));
        }

        if (typeof trip.wanderly?.tripTax === "number") {
          setTaxRatePct(String(trip.wanderly.tripTax));
        } else if (typeof trip.taxRate === "number") {
          setTaxRatePct(String(Math.round(trip.taxRate * 10000) / 100));
        }

        if (typeof trip.wanderly?.city === "string" && trip.wanderly.city) {
          setResolvedCity(trip.wanderly.city);
        }
        if (typeof trip.wanderly?.latitude === "number") {
          setPlaceLat(trip.wanderly.latitude);
        } else {
          setPlaceLat(null);
        }
        if (typeof trip.wanderly?.longitude === "number") {
          setPlaceLng(trip.wanderly.longitude);
        } else {
          setPlaceLng(null);
        }

        setStep(1);
        setAiGenerated(false);
        setDuplicateReady(true);
      })
      .catch(() => {
        if (!cancelled) setDuplicateError("Could not load trip to copy.");
      })
      .finally(() => {
        if (!cancelled) setDuplicateLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [duplicateFromId]);

  const duration = Math.max(
    1,
    Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  /** YYYY-MM-DD end must be on or after start. */
  const datesValid = Boolean(startDate && endDate && endDate >= startDate);
  /** Close-join date is optional; when set it must be on/before start. */
  const closeJoinDateValid =
    !closeJoinDate || (startDate ? closeJoinDate <= startDate : true);
  const itineraryMatchesTripLength =
    datesValid && itinerary.length === duration;

  const canNext = () => {
    if (step === 1)
      return title && destination && country && description && categories.length > 0;
    if (step === 2) {
      return datesValid && closeJoinDateValid && maxGroupSize > 0;
    }
    if (step === 3) {
      return (
        datesValid &&
        itineraryMatchesTripLength &&
        itinerary.every((d) => d.title && d.description)
      );
    }
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

  const handleCreate = async (asDraft = false) => {
    if (asDraft) {
      router.push("/partner/trips");
      return;
    }
    if (!packUser?.id) {
      setCreateError("Sign in as a host to publish trips to Wanderly.");
      return;
    }
    if (!coverFile || !agreementFile) {
      setCreateError(
        "Add a cover image and agreement document (step 5) before publishing."
      );
      return;
    }
    if (!validateWanderlyTripName(title)) {
      setCreateError(`Trip title: ${WANDERLY_TRIP_NAME_HINT}`);
      return;
    }
    if (!validateWanderlyTripDescription(description)) {
      setCreateError(
        "Description must be between 1 and 1,000 characters (no empty description)."
      );
      return;
    }
    if (!datesValid) {
      setCreateError("End date must be on or after the start date.");
      return;
    }
    if (!itineraryMatchesTripLength) {
      setCreateError(
        `Itinerary must have exactly ${duration} day(s) to match your trip length (${formatIsoToDDMMYYYY(
          startDate
        )} – ${formatIsoToDDMMYYYY(endDate)}). You have ${
          itinerary.length
        } day(s) planned.`
      );
      return;
    }
    const dest = destination.trim();
    const cityVal =
      resolvedCity.trim() || dest || country.trim() || title.trim();
    const form = new FormData();
    form.append("tripName", title.trim());
    form.append("destination", dest || cityVal);
    form.append("description", description.trim());
    form.append("tripType", categories[0] || "Adventure");
    const includedClean = included.map((s) => s.trim()).filter(Boolean);
    const notIncludedClean = notIncluded.map((s) => s.trim()).filter(Boolean);
    if (includedClean.length === 0 || notIncludedClean.length === 0) {
      setCreateError(
        "Add at least one item under What's included and What's not included."
      );
      return;
    }
    form.append("whatsIncluded", JSON.stringify(includedClean));
    form.append("whatsNotIncluded", JSON.stringify(notIncludedClean));
    form.append("duration", String(duration));
    form.append("maxGuests", String(maxGroupSize));
    form.append("price", String(useTieredPricing ? priceSolo : price));
    form.append("nights", String(Math.max(0, duration - 1)));
    form.append("mornings", String(duration));
    form.append("startDate", formatIsoToDDMMYYYY(startDate));
    form.append("endDate", formatIsoToDDMMYYYY(endDate));
    form.append("adminUserId", packUser.id);
    const itineraryPayload = itinerary.map((d, i) => ({
      day: i + 1,
      title: d.title,
      description: d.description,
      activities: d.activities.filter((a) => a.trim().length > 0),
    }));
    form.append("itinerary", JSON.stringify(itineraryPayload));
    form.append(
      "amenities",
      JSON.stringify(
        categories.length > 0 ? categories : ["Local guide", "Small group"]
      )
    );
    form.append("visibility", "public");
    form.append("adminProfile", packUser.image || "");
    form.append("adminName", (packUser.name || "Host").trim());
    form.append("country", country.trim());
    form.append("city", cityVal);
    form.append("tripTax", String(Number(taxRatePct) || 0));
    form.append("latitude", placeLat != null ? String(placeLat) : "0");
    form.append("longitude", placeLng != null ? String(placeLng) : "0");
    form.append("otherTripName", "");
    form.append("paylater", String(installmentsEnabled));
    if (installmentsEnabled) {
      form.append("paymentSchedule", paymentSchedule);
      if (paymentSchedule === "custom") {
        form.append(
          "paymentCustomSplits",
          JSON.stringify(paymentCustomSplits)
        );
      }
    }
    if (closeJoinDate) {
      form.append("closeJoinDate", closeJoinDate);
    }

    form.append("tripImages", coverFile);
    galleryFiles.slice(0, 7).forEach((f) => form.append("tripImages", f));
    const acc = galleryFiles.length > 0 ? galleryFiles.slice(0, 3) : [coverFile];
    acc.forEach((f) => form.append("AccImages", f));
    form.append("agreement", agreementFile);

    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/partner/trips/create", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        status?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok || data.status !== "success") {
        const msg =
          (typeof data.message === "string" && data.message) ||
          (typeof data.error === "string" && data.error) ||
          `Could not create trip (${res.status})`;
        throw new Error(msg);
      }
      const newId = (data as { tripId?: string }).tripId;
      router.push(
        typeof newId === "string" && newId
          ? `/partner/trips/${encodeURIComponent(newId)}`
          : "/partner/trips"
      );
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : "Could not create trip");
    } finally {
      setCreating(false);
    }
  };

  if (hostNeedsStripeConnect(packUser)) {
    return <StripeRequiredForCreate kind="trip" />;
  }

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Create a new trip
            </h1>
            <p className="mt-1 text-muted-foreground">
              Build your group adventure in {steps.length} easy steps
            </p>
          </div>
          <Button
            onClick={() => setAiOpen(true)}
            className="gap-2 bg-gradient-to-r from-violet-500 to-primary hover:brightness-110 transition-all shrink-0"
          >
            <Wand2 className="h-4 w-4" />
            Create with AI
          </Button>
        </div>

        {aiGenerated && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-violet-50 border border-violet-200 p-3 text-xs text-violet-900">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <p>
              <span className="font-semibold">AI draft ready.</span> Review each
              step and tweak anything before publishing — AI-generated content is
              a starting point.
            </p>
          </div>
        )}

        {duplicateFromId && duplicateLoading && (
          <div className="mt-4 rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
            Copying trip details…
          </div>
        )}
        {duplicateError && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {duplicateError}
          </div>
        )}
        {duplicateReady && !duplicateLoading && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
            <Copy className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p>
              <span className="font-semibold">Draft from an existing trip.</span>{" "}
              Re-upload cover, gallery, and agreement in step 5 before
              publishing — file copies are not moved for you.
            </p>
          </div>
        )}
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:items-start">
                <DestinationPlaceField
                  destination={destination}
                  onDestinationChange={setDestination}
                  onCountryChange={setCountry}
                  onPlaceResolved={(p) => {
                    setResolvedCity(p.city);
                    setPlaceLat(p.latitude);
                    setPlaceLng(p.longitude);
                  }}
                  onManualEdit={() => {
                    setResolvedCity("");
                    setPlaceLat(null);
                    setPlaceLng(null);
                  }}
                />
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g., Italy"
                  />
                  {placeLat != null && placeLng != null ? (
                    <p className="text-xs text-muted-foreground">
                      Location pin: {placeLat.toFixed(5)}, {placeLng.toFixed(5)}
                    </p>
                  ) : null}
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
                  {duration} day{duration !== 1 ? "s" : ""}
                </p>
                {startDate && endDate && endDate < startDate && (
                  <p className="text-xs text-destructive mt-2">
                    End date must be on or after the start date.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Close booking on{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  {closeJoinDate && (
                    <button
                      type="button"
                      onClick={() => setCloseJoinDate("")}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <Input
                  type="date"
                  value={closeJoinDate}
                  onChange={(e) => setCloseJoinDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  max={startDate}
                />
                <p className="text-xs text-muted-foreground">
                  After this date, new travelers can&apos;t join. Leave blank to
                  accept bookings until the trip starts.
                </p>
                {closeJoinDate && !closeJoinDateValid && (
                  <p className="text-xs text-destructive">
                    Close-booking date must be on or before the trip start
                    date.
                  </p>
                )}
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
                <div className="flex items-center justify-between mb-1">
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
                {datesValid && (
                  <p
                    className={
                      itineraryMatchesTripLength
                        ? "text-xs text-muted-foreground mb-3"
                        : "text-xs text-destructive mb-3"
                    }
                  >
                    This trip is <strong>{duration}</strong> day
                    {duration !== 1 ? "s" : ""} long — add exactly{" "}
                    <strong>{duration}</strong> day
                    {duration !== 1 ? "s" : ""} below (you have{" "}
                    {itinerary.length}).
                  </p>
                )}
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
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="pp-cover-file"
                  onChange={(e) =>
                    setCoverFile(e.target.files?.[0] ?? null)
                  }
                />
                <label
                  htmlFor="pp-cover-file"
                  className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary cursor-pointer"
                >
                  <Upload className="h-6 w-6" />
                  <p className="text-sm font-medium">
                    {coverFile ? coverFile.name : "Click to upload cover photo"}
                  </p>
                  <p className="text-xs">JPG or PNG · Landscape 16:9 preferred</p>
                </label>
              </div>

              <div>
                <Label className="mb-2 block">Gallery photos (optional)</Label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="pp-gallery-files"
                  onChange={(e) =>
                    setGalleryFiles(Array.from(e.target.files || []))
                  }
                />
                <label
                  htmlFor="pp-gallery-files"
                  className="flex aspect-video max-w-md rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary cursor-pointer"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-xs font-medium">
                    {galleryFiles.length > 0
                      ? `${galleryFiles.length} file(s) selected`
                      : "Add more trip images"}
                  </span>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Extra images are appended to the trip gallery sent to Wanderly.
                </p>
              </div>

              <div>
                <Label className="mb-2 block">Host agreement (PDF or image)</Label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  id="pp-agreement-file"
                  onChange={(e) =>
                    setAgreementFile(e.target.files?.[0] ?? null)
                  }
                />
                <label
                  htmlFor="pp-agreement-file"
                  className="flex rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors py-8 flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary cursor-pointer"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-sm">
                    {agreementFile
                      ? agreementFile.name
                      : "Upload signed agreement"}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 6 - Pricing */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold">Pricing</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Set your price per traveler — or unlock group discounts
                </p>
              </div>

              {/* Flat vs Tiered toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/50">
                <button
                  type="button"
                  onClick={() => setUseTieredPricing(false)}
                  className={cn(
                    "rounded-lg py-2 text-xs font-semibold transition-colors",
                    !useTieredPricing
                      ? "bg-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Flat price
                </button>
                <button
                  type="button"
                  onClick={() => setUseTieredPricing(true)}
                  className={cn(
                    "rounded-lg py-2 text-xs font-semibold transition-colors",
                    useTieredPricing
                      ? "bg-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Tiered (group discounts)
                </button>
              </div>

              {!useTieredPricing ? (
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
                    Similar {difficulty.toLowerCase()} trips in{" "}
                    {country || "your area"} charge $1,500-$3,500
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Set different rates based on how many travelers book
                    together. The discounted rate applies to everyone in the
                    group.
                  </p>

                  {[
                    {
                      key: "solo",
                      label: "Solo traveler",
                      hint: "1 traveler",
                      value: priceSolo,
                      setter: setPriceSolo,
                    },
                    {
                      key: "couple",
                      label: "Couple / duo",
                      hint: "2 travelers",
                      value: priceCouple,
                      setter: setPriceCouple,
                    },
                    {
                      key: "groupOf3",
                      label: "Group rate",
                      hint: "3+ travelers",
                      value: priceGroupOf3,
                      setter: setPriceGroupOf3,
                    },
                  ].map((tier) => (
                    <div
                      key={tier.key}
                      className="rounded-xl border p-3 flex items-center gap-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{tier.label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {tier.hint}
                        </p>
                      </div>
                      <div className="relative w-36">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          value={tier.value}
                          onChange={(e) => tier.setter(Number(e.target.value))}
                          className="pl-7 h-10 font-semibold text-right"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                    <p className="font-semibold mb-1">💡 Group discount tip</p>
                    <p className="text-[11px] leading-relaxed">
                      Travelers see the discount auto-apply at checkout as the
                      group grows. Larger groups pay less per person and you
                      earn more overall.
                    </p>
                  </div>
                </div>
              )}

              {/* Tax rate */}
              <div className="rounded-xl border bg-white p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label>Tax rate</Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Applied to every booking before checkout.
                    </p>
                  </div>
                  <div className="relative w-28 shrink-0">
                    <Input
                      type="number"
                      min={0}
                      max={30}
                      step={0.01}
                      value={taxRatePct}
                      onChange={(e) => setTaxRatePct(e.target.value)}
                      className="pr-8 h-10 font-semibold text-right"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t">
                  Pack &amp; Pally&apos;s 3% platform fee is applied
                  automatically on top — no action needed.
                </p>
              </div>

              <PartialPaymentCard
                enabled={installmentsEnabled}
                onEnabledChange={setInstallmentsEnabled}
                schedule={paymentSchedule}
                onScheduleChange={setPaymentSchedule}
                customSplits={paymentCustomSplits}
                onCustomSplitsChange={setPaymentCustomSplits}
                totalPerPerson={useTieredPricing ? priceSolo : price}
                startDate={startDate}
              />

              <div className="rounded-xl bg-primary/5 border border-primary/10 p-5">
                <p className="text-sm font-semibold mb-4">
                  Your potential earnings
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(() => {
                    const ratesFor = (n: number) =>
                      !useTieredPricing
                        ? price
                        : n <= 1
                        ? priceSolo
                        : n === 2
                        ? priceCouple
                        : priceGroupOf3;
                    const half = Math.max(1, Math.ceil(maxGroupSize / 2));
                    const threeQ = Math.max(1, Math.ceil(maxGroupSize * 0.75));
                    const full = maxGroupSize;
                    return (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            If 50% full
                          </p>
                          <p className="text-lg font-bold">
                            $
                            {Math.round(
                              ratesFor(half) * half * 0.85
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            If 75% full
                          </p>
                          <p className="text-lg font-bold">
                            $
                            {Math.round(
                              ratesFor(threeQ) * threeQ * 0.85
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            If sold out
                          </p>
                          <p className="text-lg font-bold text-primary">
                            $
                            {Math.round(
                              ratesFor(full) * full * 0.85
                            ).toLocaleString()}
                          </p>
                        </div>
                      </>
                    );
                  })()}
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
                  <p
                    className={
                      itineraryMatchesTripLength
                        ? "text-sm"
                        : "text-sm text-destructive"
                    }
                  >
                    {itinerary.length} of {duration} day
                    {duration !== 1 ? "s" : ""} planned
                    {!itineraryMatchesTripLength && datesValid
                      ? " — must match trip length"
                      : ""}
                  </p>
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
          <div className="mt-8 flex flex-col gap-3 pt-6 border-t">
            {createError ? (
              <p className="text-sm text-red-600">{createError}</p>
            ) : null}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1 || creating}
              >
                Back
              </Button>
              {step < steps.length ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canNext()}>
                  Continue
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCreate(true)}
                    disabled={creating}
                  >
                    Save as draft
                  </Button>
                  <Button
                    onClick={() => handleCreate(false)}
                    disabled={
                      creating || !coverFile || !agreementFile || !packUser?.id
                    }
                  >
                    {creating ? "Publishing…" : "Publish trip"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AiTripModal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onGenerated={(result, inputs) => {
          // Close modal
          setAiOpen(false);
          setAiGenerated(true);

          // Step 1 fields
          setTitle(result.title);
          setDestination(inputs.destination);
          setCountry(inputs.country);
          setResolvedCity("");
          setPlaceLat(null);
          setPlaceLng(null);
          setDescription(result.description);
          setCategories(inputs.categories);
          setDifficulty(inputs.difficulty);

          // Step 2 — dates span the generated duration
          const today = new Date();
          const start = new Date(today.getTime() + 30 * 86400000);
          const end = new Date(
            start.getTime() + inputs.durationDays * 86400000
          );
          setStartDate(start.toISOString().split("T")[0]);
          setEndDate(end.toISOString().split("T")[0]);
          setMaxGroupSize(inputs.maxGroupSize);

          // Step 3 — highlights + itinerary
          setHighlights(result.highlights);
          setItinerary(result.itinerary);

          // Step 4 — included / not included
          setIncluded(result.included);
          setNotIncluded(result.notIncluded);

          // Step 6 — pricing
          setPrice(result.suggestedPrice);

          // Jump to step 1 so the host can review from the top
          setStep(1);
        }}
      />
    </div>
  );
}

