"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  Eye,
  MapPin,
  Calendar,
  Users,
  Mountain,
  Clock,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Share2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { partnerTrips, type PartnerTrip } from "@/data/partner-trips";
import { getUserPartnerTrips } from "@/lib/user-partner-trips";
import { CURRENT_PARTNER } from "@/data/conversations";
import { hosts } from "@/data/hosts";
import { CURRENT_PARTNER_HOST_ID } from "@/lib/host-terms";
import {
  calculatePriceBreakdown,
  formatRatePercent,
} from "@/lib/trip-pricing";
import {
  resolveCancellationPolicy,
  CANCELLATION_PRESETS,
} from "@/lib/host-terms";
import { cn } from "@/lib/utils";

function findTrip(id: string): PartnerTrip | null {
  const userTrips = getUserPartnerTrips();
  return (
    userTrips.find((t) => t.id === id) ||
    partnerTrips.find((t) => t.id === id) ||
    null
  );
}

export default function PartnerTripPreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const trip = useMemo(() => findTrip(id), [id]);
  const [imageIdx, setImageIdx] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  if (!trip) {
    return (
      <div className="flex flex-col h-full min-h-[844px] bg-white">
        <div className="flex items-center gap-2 p-3 border-b">
          <button
            onClick={() => router.push("/mobile/partner")}
            className="text-sm text-muted-foreground"
          >
            Back
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <p className="font-semibold">Trip not found</p>
        </div>
      </div>
    );
  }

  const host =
    hosts.find((h) => h.id === CURRENT_PARTNER_HOST_ID) || null;
  const spotsLeft = Math.max(0, trip.maxGroupSize - trip.currentBookings);
  const fillPercent = (trip.currentBookings / trip.maxGroupSize) * 100;
  const cancellationPolicy = resolveCancellationPolicy(CURRENT_PARTNER_HOST_ID);
  const cancelPreset =
    cancellationPolicy.preset !== "custom"
      ? CANCELLATION_PRESETS[cancellationPolicy.preset]
      : null;
  const breakdown = calculatePriceBreakdown(trip.price, trip.taxRate);
  const images = trip.images && trip.images.length > 0 ? trip.images : [trip.coverImage];

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      {/* Preview banner */}
      <div className="sticky top-0 z-40 bg-primary text-white px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5" />
          <p className="text-[11px] font-semibold">
            Previewing as traveler · read-only
          </p>
        </div>
        <button
          onClick={() => router.push(`/mobile/partner/trips/${id}`)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
          aria-label="Close preview"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Image */}
        <div className="relative h-72 w-full">
          {images[imageIdx] && (
            <Image
              src={images[imageIdx]}
              alt={trip.title}
              fill
              sizes="400px"
              className="object-cover"
              priority
            />
          )}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {images.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImageIdx(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === imageIdx ? "w-6 bg-white" : "w-1.5 bg-white/60"
                  )}
                />
              ))}
            </div>
          )}

          {/* Fake header icons */}
          <div className="absolute top-3 right-3 flex gap-2 pointer-events-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md">
              <Share2 className="h-4 w-4" />
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md">
              <Heart className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-t-3xl -mt-5 relative z-10 p-5">
          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {trip.category.map((c) => (
              <Badge key={c} variant="secondary" className="text-[10px]">
                {c}
              </Badge>
            ))}
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
              <Mountain className="h-2.5 w-2.5 mr-0.5" />
              {trip.difficulty}
            </Badge>
          </div>

          <h1 className="text-xl font-bold leading-tight">{trip.title}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" />
            {trip.destination}, {trip.country}
          </p>

          {trip.reviewCount > 0 && (
            <div className="mt-3 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-0.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold">{trip.rating}</span>
                <span className="text-muted-foreground">
                  ({trip.reviewCount})
                </span>
              </div>
            </div>
          )}

          {/* Dates + duration + spots */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <MetaTile
              icon={<Calendar className="h-3 w-3" />}
              label="Dates"
              value={new Date(trip.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            />
            <MetaTile
              icon={<Clock className="h-3 w-3" />}
              label="Duration"
              value={`${trip.durationDays} days`}
            />
            <MetaTile
              icon={<Users className="h-3 w-3" />}
              label="Spots left"
              value={String(spotsLeft)}
            />
          </div>

          {/* Fill bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-muted-foreground">
                {trip.currentBookings} of {trip.maxGroupSize} travelers booked
              </span>
              <span className="font-semibold">
                {Math.round(fillPercent)}% full
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          <Separator className="my-5" />

          {/* About */}
          <h2 className="text-sm font-bold mb-2">About this adventure</h2>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {trip.description}
          </p>

          {/* Price breakdown */}
          <Separator className="my-5" />
          <div className="rounded-xl border bg-muted/20 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Price per person
            </p>
            <div className="space-y-1 text-xs">
              <Row label="Subtotal" value={`$${trip.price.toLocaleString()}`} />
              <Row
                label={`Tax (${formatRatePercent(breakdown.taxRate)})`}
                value={`$${breakdown.tax.toLocaleString()}`}
              />
              <Row
                label={`Platform fee (${formatRatePercent(breakdown.platformFeeRate)})`}
                value={`$${breakdown.platformFee.toLocaleString()}`}
              />
              <div className="pt-1.5 border-t mt-1.5">
                <Row
                  label="Total"
                  value={`$${breakdown.total.toLocaleString()}`}
                  bold
                />
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Highlights */}
          <h2 className="text-sm font-bold mb-3">Trip highlights</h2>
          {trip.highlights.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No highlights added yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {trip.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}

          <Separator className="my-5" />

          {/* Itinerary */}
          <h2 className="text-sm font-bold mb-3">Itinerary</h2>
          {trip.itinerary.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No itinerary yet.
            </p>
          ) : (
            <div className="space-y-2">
              {trip.itinerary.map((day) => {
                const expanded = expandedDay === day.day;
                return (
                  <button
                    key={day.day}
                    onClick={() => setExpandedDay(expanded ? null : day.day)}
                    className="w-full rounded-xl border p-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary shrink-0">
                        {day.day}
                      </span>
                      <span className="flex-1 font-semibold text-xs">
                        {day.title}
                      </span>
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    {expanded && (
                      <div className="mt-3 pl-10">
                        <p className="text-xs text-muted-foreground">
                          {day.description}
                        </p>
                        {day.activities.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {day.activities.map((a, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-1.5 text-[11px]"
                              >
                                <div className="h-1 w-1 rounded-full bg-primary/60" />
                                {a}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <Separator className="my-5" />

          {/* Included / Not included */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-bold mb-2 flex items-center gap-1 text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                Included
              </h3>
              <ul className="space-y-1">
                {trip.included.slice(0, 6).map((i) => (
                  <li key={i} className="text-[11px] text-muted-foreground">
                    • {i}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold mb-2 flex items-center gap-1 text-red-600">
                <X className="h-3.5 w-3.5" />
                Not Included
              </h3>
              <ul className="space-y-1">
                {trip.notIncluded.slice(0, 6).map((i) => (
                  <li key={i} className="text-[11px] text-muted-foreground">
                    • {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Cancellation policy */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              Cancellation policy
            </p>
            <p className="mt-0.5 text-xs font-semibold text-foreground">
              {cancelPreset
                ? `${cancelPreset.label} — ${cancelPreset.headline}`
                : "Custom policy"}
            </p>
          </div>

          <Separator className="my-5" />

          {/* Host */}
          {host && (
            <>
              <h2 className="text-sm font-bold mb-3">Your host</h2>
              <div className="rounded-xl bg-muted/30 p-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full shrink-0">
                    <Image
                      src={host.avatar}
                      alt={host.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{host.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {host.location}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px]">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {host.rating}
                      </span>
                      <span className="text-muted-foreground">
                        {host.tripsHosted} trips hosted
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-3 h-9 gap-1.5 bg-white cursor-not-allowed opacity-70"
                  disabled
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Message {CURRENT_PARTNER.name.split(" ")[0]}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sticky footer — simulates traveler's Join bar but disabled */}
      <div className="sticky bottom-0 bg-white border-t p-4 md:pb-8 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xl font-bold">${trip.price.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">per person</p>
        </div>
        <Button disabled size="lg" className="flex-1 h-12 opacity-60">
          Join this trip
        </Button>
      </div>

      {/* Floating close button */}
      <div className="fixed bottom-20 right-4 z-30">
        <Button
          asChild
          size="sm"
          className="shadow-lg gap-1.5"
        >
          <Link href={`/mobile/partner/trips/${id}`}>
            <X className="h-3.5 w-3.5" />
            Close preview
          </Link>
        </Button>
      </div>
    </div>
  );
}

function MetaTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border p-3">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold flex items-center gap-1 mt-0.5">
        {icon}
        {value}
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          bold ? "font-bold" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
      <span className={cn(bold && "font-bold")}>{value}</span>
    </div>
  );
}
