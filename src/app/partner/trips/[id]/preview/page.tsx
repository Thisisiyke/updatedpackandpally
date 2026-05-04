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
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { partnerTrips, type PartnerTrip } from "@/data/partner-trips";
import { getUserPartnerTrips } from "@/lib/user-partner-trips";
import { CURRENT_PARTNER } from "@/data/conversations";
import { hosts } from "@/data/hosts";
import {
  CURRENT_PARTNER_HOST_ID,
  resolveCancellationPolicy,
  CANCELLATION_PRESETS,
} from "@/lib/host-terms";
import {
  calculatePriceBreakdown,
  formatRatePercent,
} from "@/lib/trip-pricing";
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
      <Container className="py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Trip not found</h1>
          <Button asChild className="mt-6">
            <Link href="/partner/trips">Back to trips</Link>
          </Button>
        </div>
      </Container>
    );
  }

  const host = hosts.find((h) => h.id === CURRENT_PARTNER_HOST_ID) || null;
  const spotsLeft = Math.max(0, trip.maxGroupSize - trip.currentBookings);
  const fillPercent = (trip.currentBookings / trip.maxGroupSize) * 100;
  const cancellationPolicy = resolveCancellationPolicy(CURRENT_PARTNER_HOST_ID);
  const cancelPreset =
    cancellationPolicy.preset !== "custom"
      ? CANCELLATION_PRESETS[cancellationPolicy.preset]
      : null;
  const breakdown = calculatePriceBreakdown(trip.price, trip.taxRate);
  const images =
    trip.images && trip.images.length > 0 ? trip.images : [trip.coverImage];

  return (
    <section className="bg-muted/20 pb-20">
      {/* Preview banner */}
      <div className="sticky top-0 z-40 bg-primary text-white">
        <Container className="py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <p className="text-sm font-semibold">
              Previewing as traveler · read-only
            </p>
          </div>
          <button
            onClick={() => router.push(`/partner/trips/${id}`)}
            className="flex h-8 items-center gap-1 rounded-full bg-white/20 hover:bg-white/30 px-3 text-xs font-semibold"
            aria-label="Close preview"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </Container>
      </div>

      <Container className="mt-6">
        {/* Photo gallery */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:grid-rows-2 md:h-[420px]">
          <div className="relative col-span-1 md:col-span-2 md:row-span-2 overflow-hidden rounded-xl">
            <Image
              src={images[imageIdx]}
              alt={trip.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="absolute top-3 right-3 flex gap-2 pointer-events-none">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md">
                <Share2 className="h-4 w-4" />
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md">
                <Heart className="h-4 w-4" />
              </div>
            </div>
          </div>
          {images.slice(1, 5).map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setImageIdx(i + 1)}
              className="relative hidden md:block overflow-hidden rounded-xl"
            >
              <Image
                src={img}
                alt={`${trip.title} ${i + 2}`}
                fill
                className="object-cover hover:opacity-90 transition-opacity"
                sizes="25vw"
              />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {trip.category.map((c) => (
                <Badge key={c} variant="secondary" className="gap-1">
                  {c}
                </Badge>
              ))}
              <Badge variant="secondary" className="gap-1">
                <Mountain className="h-3 w-3" />
                {trip.difficulty}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {trip.durationDays} days
              </Badge>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {trip.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {trip.destination}, {trip.country}
            </p>

            {trip.reviewCount > 0 && (
              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 font-medium">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {trip.rating}
                </span>
                <span className="text-muted-foreground">
                  {trip.reviewCount} reviews
                </span>
              </div>
            )}

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {trip.description}
            </p>

            <Separator className="my-8" />

            {/* Highlights */}
            <h2 className="text-xl font-bold">Trip Highlights</h2>
            {trip.highlights.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground italic">
                No highlights added yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {trip.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            <Separator className="my-8" />

            {/* Itinerary */}
            <h2 className="text-xl font-bold">Itinerary</h2>
            {trip.itinerary.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground italic">
                No itinerary yet.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {trip.itinerary.map((day) => {
                  const expanded = expandedDay === day.day;
                  return (
                    <button
                      key={day.day}
                      onClick={() => setExpandedDay(expanded ? null : day.day)}
                      className="w-full rounded-xl border bg-white p-4 text-left transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shrink-0">
                          {day.day}
                        </span>
                        <span className="flex-1 font-semibold">
                          {day.title}
                        </span>
                        {expanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      {expanded && (
                        <div className="mt-3 pl-11">
                          <p className="text-muted-foreground">
                            {day.description}
                          </p>
                          {day.activities.length > 0 && (
                            <ul className="mt-3 space-y-1.5">
                              {day.activities.map((a, i) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
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

            <Separator className="my-8" />

            {/* Included / Not Included */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div>
                <h2 className="text-xl font-bold">What&apos;s Included</h2>
                <ul className="mt-4 space-y-2.5">
                  {trip.included.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-bold">Not Included</h2>
                <ul className="mt-4 space-y-2.5">
                  {trip.notIncluded.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Cancellation policy */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                Cancellation policy
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">
                {cancelPreset
                  ? `${cancelPreset.label} — ${cancelPreset.headline}`
                  : "Custom policy"}
              </p>
            </div>

            {/* Host card */}
            {host && (
              <div className="mt-8 rounded-2xl border bg-white p-6">
                <h2 className="text-xl font-bold mb-4">Your Host</h2>
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={host.avatar}
                      alt={host.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{host.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {host.location}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {host.rating}
                      </span>
                      <span className="text-muted-foreground">
                        {host.tripsHosted} trips hosted
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {host.bio}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 gap-1.5 cursor-not-allowed opacity-70"
                  disabled
                >
                  <MessageCircle className="h-4 w-4" />
                  Message {CURRENT_PARTNER.name.split(" ")[0]}
                </Button>
              </div>
            )}
          </div>

          {/* Right — booking card */}
          <div>
            <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-lg">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  ${trip.price.toLocaleString()}
                </span>
                <span className="text-muted-foreground">per person</span>
              </div>

              <Separator className="my-5" />

              <div className="space-y-1.5 text-sm">
                <Row label="Subtotal" value={`$${trip.price.toLocaleString()}`} />
                <Row
                  label={`Tax (${formatRatePercent(breakdown.taxRate)})`}
                  value={`$${breakdown.tax.toLocaleString()}`}
                />
                <Row
                  label={`Platform fee (${formatRatePercent(
                    breakdown.platformFeeRate
                  )})`}
                  value={`$${breakdown.platformFee.toLocaleString()}`}
                />
                <div className="pt-2 border-t mt-2 flex items-center justify-between">
                  <span className="font-medium">Total</span>
                  <span className="text-2xl font-bold">
                    ${breakdown.total.toLocaleString()}
                  </span>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Dates</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(trip.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    —{" "}
                    {new Date(trip.endDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      Group size
                    </span>
                    <span className="text-muted-foreground">
                      {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {trip.currentBookings} of {trip.maxGroupSize} booked
                  </p>
                </div>

                <Button
                  disabled
                  size="lg"
                  className="w-full h-12 text-base opacity-60"
                >
                  Join This Trip
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("flex items-center justify-between")}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
