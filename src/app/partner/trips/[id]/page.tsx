"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Save,
  Eye,
  Check,
  X,
  Plus,
  Star,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  partnerTrips,
  defaultIncluded,
  defaultNotIncluded,
  tripCategories,
} from "@/data/partner-trips";
import { AiSurveyCard } from "@/components/partner/ai-survey-card";
import { CURRENT_PARTNER } from "@/data/conversations";
import { cn } from "@/lib/utils";

function SavedToast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg animate-[fade-in-up_300ms_ease-out]">
      <Check className="h-4 w-4" />
      Changes saved
    </div>
  );
}

export default function TripEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const initial = partnerTrips.find((t) => t.id === id);

  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState(initial?.title || "");
  const [destination, setDestination] = useState(initial?.destination || "");
  const [country, setCountry] = useState(initial?.country || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty || "Easy");
  const [price, setPrice] = useState(initial?.price || 0);
  const [taxRatePct, setTaxRatePct] = useState(
    typeof initial?.taxRate === "number"
      ? (initial.taxRate * 100).toString()
      : "8.25"
  );
  const [maxGroupSize, setMaxGroupSize] = useState(initial?.maxGroupSize || 10);
  const [status, setStatus] = useState(initial?.status || "draft");
  const [categories, setCategories] = useState<string[]>(initial?.category || []);
  const [included, setIncluded] = useState<string[]>(initial?.included || []);
  const [notIncluded, setNotIncluded] = useState<string[]>(
    initial?.notIncluded || []
  );
  const [requireTravelerId, setRequireTravelerId] = useState(
    !!initial?.requireTravelerId
  );
  const [requestSocialMedia, setRequestSocialMedia] = useState(
    !!initial?.requestSocialMedia
  );
  const [highlights, setHighlights] = useState<string[]>(
    initial?.highlights || []
  );
  const [customIncluded, setCustomIncluded] = useState("");
  const [customNotIncluded, setCustomNotIncluded] = useState("");

  if (!initial) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Trip not found</h1>
        <Button asChild className="mt-6">
          <Link href="/partner/trips">Back to trips</Link>
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleCategory = (c: string) => {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const fillPercent = (initial.currentBookings / initial.maxGroupSize) * 100;

  return (
    <div className="p-6 lg:p-10">
      <SavedToast visible={saved} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 shrink-0">
            <Link href="/partner/trips">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title || "Untitled trip"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              {destination}, {country}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            className={cn(
              status === "published" && "bg-emerald-100 text-emerald-800 border-emerald-200",
              status === "draft" && "bg-gray-100 text-gray-700 border-gray-200",
              status === "sold-out" && "bg-amber-100 text-amber-800 border-amber-200"
            )}
          >
            {status === "sold-out" ? "Sold Out" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Trip sub-section tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        <span className="rounded-md bg-white px-4 py-1.5 text-sm font-semibold shadow-sm">
          Overview
        </span>
        <Link
          href={`/partner/trips/${id}/travelers`}
          className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Travelers
        </Link>
        <Link
          href={`/partner/trips/${id}/surveys`}
          className="rounded-md px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Surveys
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left - Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basics */}
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-bold mb-4">Basics</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Trip title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Destination</Label>
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v) => v && setDifficulty(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Challenging">Challenging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max group size</Label>
                  <Input
                    type="number"
                    value={maxGroupSize}
                    onChange={(e) => setMaxGroupSize(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {tripCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCategory(c)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-all",
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
            </div>
          </div>

          {/* Highlights */}
          <div className="rounded-2xl border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Trip highlights</h2>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 h-7 text-xs"
                onClick={() => setHighlights([...highlights, ""])}
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <Input
                    value={h}
                    onChange={(e) => {
                      const next = [...highlights];
                      next[i] = e.target.value;
                      setHighlights(next);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Included / Not included */}
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-bold mb-4">What&apos;s included</h2>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Included */}
              <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="font-bold text-sm">Included ({included.length})</p>
                </div>
                <div className="space-y-1.5 mb-3">
                  {included.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-lg bg-white border px-3 py-1.5"
                    >
                      <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span className="text-xs flex-1 truncate">{item}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0"
                        onClick={() => setIncluded(included.filter((i) => i !== item))}
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={customIncluded}
                    onChange={(e) => setCustomIncluded(e.target.value)}
                    placeholder="Add item..."
                    className="h-8 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customIncluded.trim()) {
                        e.preventDefault();
                        setIncluded([...included, customIncluded.trim()]);
                        setCustomIncluded("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="h-8 shrink-0"
                    onClick={() => {
                      if (customIncluded.trim()) {
                        setIncluded([...included, customIncluded.trim()]);
                        setCustomIncluded("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Not Included */}
              <div className="rounded-xl border-2 border-red-200 bg-red-50/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                    <X className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="font-bold text-sm">
                    Not included ({notIncluded.length})
                  </p>
                </div>
                <div className="space-y-1.5 mb-3">
                  {notIncluded.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-lg bg-white border px-3 py-1.5"
                    >
                      <X className="h-3 w-3 text-red-600 shrink-0" />
                      <span className="text-xs flex-1 truncate">{item}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 shrink-0"
                        onClick={() => setNotIncluded(notIncluded.filter((i) => i !== item))}
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={customNotIncluded}
                    onChange={(e) => setCustomNotIncluded(e.target.value)}
                    placeholder="Add exclusion..."
                    className="h-8 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customNotIncluded.trim()) {
                        e.preventDefault();
                        setNotIncluded([...notIncluded, customNotIncluded.trim()]);
                        setCustomNotIncluded("");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="h-8 shrink-0"
                    onClick={() => {
                      if (customNotIncluded.trim()) {
                        setNotIncluded([...notIncluded, customNotIncluded.trim()]);
                        setCustomNotIncluded("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* AI post-trip survey */}
          <AiSurveyCard
            trip={{
              id: initial.id,
              destination: initial.destination,
              country: initial.country,
              highlights: initial.highlights,
              difficulty: initial.difficulty,
              category: initial.category,
              currentBookings: initial.currentBookings,
            }}
            host={{ name: CURRENT_PARTNER.name }}
          />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-bold mb-3">Status</h3>
            <Select value={status} onValueChange={(v) => v && setStatus(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sold-out">Sold Out</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-muted-foreground">
              {status === "published" && "Visible & bookable"}
              {status === "draft" && "Not visible to travelers"}
              {status === "sold-out" && "Visible but not bookable"}
            </p>
          </div>

          {/* Cover photo */}
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-bold mb-3">Cover photo</h3>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <Image
                src={initial.coverImage}
                alt={initial.title}
                fill
                className="object-cover"
                sizes="300px"
              />
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full">
              Change photo
            </Button>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border bg-white p-6 space-y-4">
            <h3 className="font-bold">Pricing</h3>
            <div className="space-y-2">
              <Label>Price per person</Label>
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
            </div>
            <div className="space-y-2 pt-3 border-t">
              <Label>Tax rate</Label>
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
              <p className="text-[11px] text-muted-foreground">
                Plus Pack &amp; Pally&apos;s 3% platform fee, applied
                automatically.
              </p>
            </div>
          </div>

          {/* Guest data */}
          <div className="rounded-2xl border bg-white p-6 space-y-4">
            <div>
              <h3 className="font-bold">Guest data at checkout</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose what travelers fill in when they book.
              </p>
            </div>
            <WebGuestToggle
              title="Require government ID"
              hint="Travelers must upload a passport, driver's license, or national ID before they can book."
              checked={requireTravelerId}
              onToggle={() => setRequireTravelerId((v) => !v)}
            />
            <WebGuestToggle
              title="Ask for social media profile"
              hint="Optional Instagram / LinkedIn / other URL so the group recognizes each other."
              checked={requestSocialMedia}
              onToggle={() => setRequestSocialMedia((v) => !v)}
            />
          </div>

          {/* Performance */}
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-bold mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Bookings
                  </span>
                  <span className="text-sm font-bold">
                    {initial.currentBookings}/{initial.maxGroupSize}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-sm font-bold">
                    ${initial.revenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                  <p className="text-sm font-bold">
                    {initial.reviewCount > 0 ? (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {initial.rating} ({initial.reviewCount})
                      </span>
                    ) : (
                      "No reviews yet"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
            <h3 className="font-bold text-red-900 mb-1">Danger zone</h3>
            <p className="text-xs text-red-700/80 mb-4">
              Deleting a trip is permanent. Existing bookings will be cancelled.
            </p>
            <Button variant="destructive" size="sm" className="gap-1.5">
              <Trash2 className="h-4 w-4" />
              Delete trip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WebGuestToggle({
  title,
  hint,
  checked,
  onToggle,
}: {
  title: string;
  hint: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-3">
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
          {hint}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted-foreground/25"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
