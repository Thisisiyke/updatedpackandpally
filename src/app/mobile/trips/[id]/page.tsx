"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Star,
  MapPin,
  Heart,
  Share2,
  Check,
  X,
  Calendar,
  Users,
  Mountain,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { TermsModal } from "@/components/shared/terms-modal";
import { CancellationPolicyModal } from "@/components/shared/cancellation-policy-modal";
import { useWishlist } from "@/hooks/use-wishlist";
import { trips } from "@/data/trips";
import { hosts } from "@/data/hosts";
import {
  getHostTerms,
  subscribeToHostTerms,
  resolveCancellationPolicy,
  CANCELLATION_PRESETS,
} from "@/lib/host-terms";
import type { HostTerms } from "@/lib/host-terms";
import {
  calculatePriceBreakdown,
  formatRatePercent,
} from "@/lib/trip-pricing";
import { cn } from "@/lib/utils";

export default function MobileTripDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const wishlist = useWishlist();
  const [imageIdx, setImageIdx] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [hostTerms, setHostTerms] = useState<HostTerms | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const trip = trips.find((t) => t.id === id);
  const host = trip ? hosts.find((h) => h.id === trip.hostId) : null;
  const isSaved = trip ? wishlist.isSaved(trip.id, "trip") : false;

  const hostIdForTerms = trip?.hostId;
  useEffect(() => {
    if (!hostIdForTerms) return;
    const refresh = () => setHostTerms(getHostTerms(hostIdForTerms));
    refresh();
    return subscribeToHostTerms(refresh);
  }, [hostIdForTerms]);

  if (!trip) {
    return (
      <div className="flex flex-col h-full min-h-[844px]">
        <MobileHeader title="Trip" />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <p className="font-semibold">Trip not found</p>
            <Button onClick={() => router.back()} className="mt-4">Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const spotsLeft = trip.maxGroupSize - trip.currentBookings;
  const fillPercent = (trip.currentBookings / trip.maxGroupSize) * 100;

  const handleBook = () => {
    setTermsOpen(true);
  };

  const proceedToCheckout = () => {
    setTermsOpen(false);
    router.push(`/mobile/checkout?type=trip&tripId=${trip.id}`);
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/trips/${trip.id}`;
    const shareData = {
      title: `${trip.title} · Pack & Pally`,
      text: `Check out ${trip.title} in ${trip.destination}, ${trip.country} on Pack & Pally — join me?`,
      url,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // user dismissed share sheet — fall through to copy
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareToast("Link copied to clipboard");
    } catch {
      setShareToast(url);
    }
    setTimeout(() => setShareToast(null), 2400);
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      {/* Image carousel */}
      <div className="relative">
        <div className="relative h-80 w-full overflow-hidden">
          <Image
            src={trip.images[imageIdx]}
            alt={trip.title}
            fill
            className="object-cover"
            sizes="400px"
            priority
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
            {trip.images.slice(0, 5).map((_, i) => (
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
        </div>

        <MobileHeader
          transparent
          className="absolute top-0 left-0 right-0"
          action={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md"
                aria-label="Share trip"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  wishlist.toggle({
                    id: trip.id,
                    type: "trip",
                    title: trip.title,
                    subtitle: `${trip.destination}, ${trip.country}`,
                    image: trip.coverImage,
                    price: trip.price,
                  })
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isSaved ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </button>
            </div>
          }
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white rounded-t-3xl -mt-5 relative z-10">
        <div className="p-5">
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

          <div className="mt-3 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-0.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold">{trip.rating}</span>
              <span className="text-muted-foreground">({trip.reviewCount})</span>
            </div>
          </div>

          {/* Dates + group */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border p-3">
              <p className="text-[10px] text-muted-foreground">Dates</p>
              <p className="text-xs font-semibold flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" />
                {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-[10px] text-muted-foreground">Duration</p>
              <p className="text-xs font-semibold flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" />
                {trip.durationDays} days
              </p>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-[10px] text-muted-foreground">Spots left</p>
              <p className="text-xs font-semibold flex items-center gap-1 mt-0.5">
                <Users className="h-3 w-3" />
                {spotsLeft}
              </p>
            </div>
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
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          <Separator className="my-5" />

          {/* About */}
          <h2 className="text-sm font-bold mb-2">About this adventure</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {trip.description}
          </p>

          <Separator className="my-5" />

          {/* Highlights */}
          <h2 className="text-sm font-bold mb-3">Trip highlights</h2>
          <ul className="space-y-2">
            {trip.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <Separator className="my-5" />

          {/* Itinerary */}
          <h2 className="text-sm font-bold mb-3">Itinerary</h2>
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
                      <ul className="mt-2 space-y-1">
                        {day.activities.map((a, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-[11px]">
                            <div className="h-1 w-1 rounded-full bg-primary/60" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <Separator className="my-5" />

          {/* Included / Not Included */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h3 className="text-xs font-bold mb-2 flex items-center gap-1 text-emerald-700">
                <Check className="h-3.5 w-3.5" />
                Included
              </h3>
              <ul className="space-y-1">
                {trip.included.slice(0, 4).map((i) => (
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
                {trip.notIncluded.slice(0, 4).map((i) => (
                  <li key={i} className="text-[11px] text-muted-foreground">
                    • {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="my-5" />

          {/* Price breakdown */}
          {(() => {
            const subtotal = trip.price;
            const breakdown = calculatePriceBreakdown(subtotal, trip.taxRate);
            return (
              <div className="mb-5 rounded-xl border bg-muted/20 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Price per person
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Tax ({formatRatePercent(breakdown.taxRate)})
                    </span>
                    <span>${breakdown.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Platform fee (
                      {formatRatePercent(breakdown.platformFeeRate)})
                    </span>
                    <span>${breakdown.platformFee.toLocaleString()}</span>
                  </div>
                  <div className="mt-1.5 pt-1.5 border-t flex items-center justify-between font-bold">
                    <span>Total</span>
                    <span>${breakdown.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Cancellation policy summary */}
          {(() => {
            const policy = resolveCancellationPolicy(host?.id);
            const preset =
              policy.preset !== "custom"
                ? CANCELLATION_PRESETS[policy.preset]
                : null;
            return (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="w-full rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-left mb-5"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  Cancellation policy
                </p>
                <p className="mt-0.5 text-xs font-semibold text-foreground">
                  {preset
                    ? `${preset.label} — ${preset.headline}`
                    : "Custom policy — tap to read"}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Tap to see refund windows
                </p>
              </button>
            );
          })()}

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
                    <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">
                      {host.bio}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-3 h-9 gap-1.5 bg-white"
                  onClick={() => router.push("/mobile/messages")}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Message {host.name.split(" ")[0]}
                </Button>
              </div>
            </>
          )}

          <div className="h-4" />
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="sticky bottom-0 bg-white border-t p-4 md:pb-8 flex items-center gap-3">
        <div>
          <p className="text-xl font-bold">${trip.price.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">per person</p>
        </div>
        <Button onClick={handleBook} className="flex-1 h-12" size="lg">
          Join this trip
        </Button>
      </div>

      {shareToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 rounded-full bg-foreground/95 backdrop-blur px-4 py-2 text-xs font-medium text-background shadow-lg animate-[fade-in-up_300ms_ease-out]">
          <Check className="h-3.5 w-3.5" />
          {shareToast}
        </div>
      )}

      <TermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={proceedToCheckout}
        bookingType="trip"
        customTerms={
          hostTerms
            ? {
                title: hostTerms.title,
                content: hostTerms.content,
                authorName: host?.name,
                updatedAt: hostTerms.updatedAt,
              }
            : null
        }
      />

      <CancellationPolicyModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        policy={resolveCancellationPolicy(host?.id)}
        hostName={host?.name}
      />
    </div>
  );
}
