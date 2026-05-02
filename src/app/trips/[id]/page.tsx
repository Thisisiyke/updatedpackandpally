"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  ChevronRight,
  Calendar,
  Users,
  Star,
  MapPin,
  Check,
  X,
  Shield,
  Clock,
  Mountain,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/shared/container";
import { RatingStars } from "@/components/shared/rating-stars";
import { TermsModal } from "@/components/shared/terms-modal";
import { CancellationPolicyModal } from "@/components/shared/cancellation-policy-modal";
import { trips } from "@/data/trips";
import { hosts } from "@/data/hosts";
import type { Trip } from "@/types";
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
import { useRequireMember } from "@/hooks/use-require-member";

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { ensureMember, loginDialog } = useRequireMember();
  const seedTrip = trips.find((t) => t.id === id);
  const [trip, setTrip] = useState<Trip | null>(seedTrip ?? null);
  const [tripLoading, setTripLoading] = useState(!seedTrip);
  const [travelers, setTravelers] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [termsOpen, setTermsOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [hostTerms, setHostTerms] = useState<HostTerms | null>(null);

  useEffect(() => {
    const seed = trips.find((t) => t.id === id);
    if (seed) {
      setTrip(seed);
      setTripLoading(false);
      return;
    }
    let cancelled = false;
    setTripLoading(true);
    fetch(`/api/trips/${encodeURIComponent(id)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d: { trip?: Trip }) => {
        if (!cancelled && d.trip) setTrip(d.trip);
      })
      .finally(() => {
        if (!cancelled) setTripLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const hostIdForTerms = trip?.hostId;

  useEffect(() => {
    if (!hostIdForTerms) return;
    const refresh = () => setHostTerms(getHostTerms(hostIdForTerms));
    refresh();
    return subscribeToHostTerms(refresh);
  }, [hostIdForTerms]);

  if (tripLoading) {
    return (
      <div className="py-24 text-center text-muted-foreground text-sm">
        Loading trip…
      </div>
    );
  }

  if (!trip) return notFound();

  const handleBookClick = () => ensureMember(() => setTermsOpen(true));
  const proceedToCheckout = () => {
    setTermsOpen(false);
    router.push(
      `/checkout?type=trip&tripId=${encodeURIComponent(trip.id)}&travelers=${travelers}`
    );
  };

  const host = hosts.find((h) => h.id === trip.hostId);
  const spotsLeft = trip.maxGroupSize - trip.currentBookings;
  const fillPercentage = (trip.currentBookings / trip.maxGroupSize) * 100;

  const startDate = new Date(trip.startDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const endDate = new Date(trip.endDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section className="pb-20">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <Container className="py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/browse-trips" className="hover:text-foreground">
              Browse Trips
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {trip.title}
            </span>
          </nav>
        </Container>
      </div>

      <Container className="mt-8">
        {/* Photo Gallery */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:grid-rows-2 md:h-[420px]">
          <div className="relative col-span-1 md:col-span-2 md:row-span-2 overflow-hidden rounded-xl">
            <Image
              src={trip.images[selectedImage]}
              alt={trip.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          {trip.images.slice(1, 5).map((img, i) => (
            <div
              key={i}
              className="relative hidden md:block overflow-hidden rounded-xl cursor-pointer"
              onClick={() => setSelectedImage(i + 1)}
            >
              <Image
                src={img}
                alt={`${trip.title} ${i + 2}`}
                fill
                className="object-cover hover:opacity-90 transition-opacity"
                sizes="25vw"
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          {/* Left Column */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {trip.destination}, {trip.country}
              </Badge>
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

            <div className="mt-3 flex items-center gap-3">
              <RatingStars rating={trip.rating} />
              <span className="text-sm font-medium">{trip.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({trip.reviewCount} reviews)
              </span>
            </div>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {trip.description}
            </p>

            <Separator className="my-8" />

            {/* Highlights */}
            <h2 className="text-xl font-bold">Trip Highlights</h2>
            <ul className="mt-4 space-y-3">
              {trip.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <Separator className="my-8" />

            {/* Itinerary */}
            <h2 className="text-xl font-bold">Itinerary</h2>
            <Accordion defaultValue={[]} className="mt-4">
              {trip.itinerary.map((day) => (
                <AccordionItem key={day.day} value={`day-${day.day}`}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {day.day}
                      </span>
                      <span className="font-semibold">{day.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-11">
                    <p className="text-muted-foreground">{day.description}</p>
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
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

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

            {/* Host Card */}
            {host && (
              <div className="rounded-2xl border p-6">
                <h2 className="text-xl font-bold mb-4">Your Host</h2>
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={host.avatar}
                      alt={host.name}
                      fill
                      className="object-cover"
                      sizes="64px"
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
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {host.languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div>
            <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-lg">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  ${trip.price.toLocaleString()}
                </span>
                <span className="text-muted-foreground">per person</span>
              </div>

              <Separator className="my-5" />

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Dates</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {startDate} — {endDate}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">Group Size</span>
                    <span className="text-muted-foreground">
                      {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                    </span>
                  </div>
                  <Progress value={fillPercentage} className="h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {trip.currentBookings} of {trip.maxGroupSize} booked
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Travelers</p>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setTravelers(Math.max(1, travelers - 1))
                      }
                      disabled={travelers <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {travelers}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        setTravelers(
                          Math.min(spotsLeft, travelers + 1)
                        )
                      }
                      disabled={travelers >= spotsLeft}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <Separator />

                {(() => {
                  const subtotal = trip.price * travelers;
                  const breakdown = calculatePriceBreakdown(
                    subtotal,
                    trip.taxRate
                  );
                  return (
                    <>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            ${trip.price.toLocaleString()} × {travelers}
                          </span>
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
                          <span>
                            ${breakdown.platformFee.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total</span>
                        <span className="text-2xl font-bold">
                          ${breakdown.total.toLocaleString()}
                        </span>
                      </div>
                    </>
                  );
                })()}

                <Button
                  className="w-full h-12 text-base"
                  size="lg"
                  onClick={handleBookClick}
                >
                  Join This Trip
                </Button>

                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="flex w-full items-start gap-2 text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Shield className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    {(() => {
                      const p = resolveCancellationPolicy(host?.id);
                      if (p.preset === "custom") {
                        return "Custom cancellation policy — tap to read";
                      }
                      return `${CANCELLATION_PRESETS[p.preset].label} cancellation — ${CANCELLATION_PRESETS[p.preset].headline}`;
                    })()}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Booking Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white p-4 lg:hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">From</span>
              <p className="text-xl font-bold">
                ${trip.price.toLocaleString()}
              </p>
            </div>
            <Button size="lg" onClick={handleBookClick}>
              Join This Trip
            </Button>
          </div>
        </div>
      </Container>

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

      {loginDialog}
    </section>
  );
}
