"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  Calendar,
  Building2,
  TrendingUp,
  Plus,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { wanderlyItemToPartnerTripBookingRow } from "@/lib/wanderly-partner-map";
import type { PartnerOverviewPayload } from "@/lib/partner-overview-types";
import { hostNeedsStripeConnect, hostStripeIncomplete } from "@/lib/host-needs-stripe-connect";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function PartnerOverviewPage() {
  const { user } = usePackPallyAuth();
  const [overview, setOverview] = useState<PartnerOverviewPayload | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setOverview(null);
      setOverviewLoading(false);
      setOverviewError(null);
      return;
    }
    let cancelled = false;
    setOverviewLoading(true);
    setOverviewError(null);
    fetch("/api/partner/overview", { credentials: "include" })
      .then(async (r) => {
        const data = (await r.json().catch(() => ({}))) as PartnerOverviewPayload;
        if (!r.ok || data.status !== "success") {
          throw new Error(
            typeof (data as { message?: string }).message === "string"
              ? (data as { message: string }).message
              : "Could not load overview"
          );
        }
        return data;
      })
      .then((d) => {
        if (!cancelled) setOverview(d);
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setOverview(null);
          setOverviewError(e.message || "Overview failed");
        }
      })
      .finally(() => {
        if (!cancelled) setOverviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const recentBookings = useMemo(() => {
    const raw = overview?.recentBookings;
    if (!Array.isArray(raw)) return [];
    const rows = raw.map((b) => wanderlyItemToPartnerTripBookingRow(b));
    rows.sort(
      (a, b) =>
        new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
    );
    return rows.slice(0, 5);
  }, [overview?.recentBookings]);

  const statCards = useMemo(() => {
    const col = overview?.totalCollected ?? 0;
    const bookings = overview?.confirmedBookingsCount ?? 0;
    const active = overview?.activeTripCount ?? 0;
    const occ = overview?.avgOccupancyPct ?? 0;

    return [
      {
        label: "Total collected",
        value: overviewLoading ? "…" : formatCurrency(col),
        change: "Booked + completed trips",
        trend: "neutral" as const,
        icon: DollarSign,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
      },
      {
        label: "Confirmed bookings",
        value: overviewLoading ? "…" : String(bookings),
        change: "Booked or completed",
        trend: "neutral" as const,
        icon: Calendar,
        color: "text-primary",
        bg: "bg-primary/10",
      },
      {
        label: "Active trips",
        value: overviewLoading ? "…" : String(active),
        change: `${overview?.completedTripCount ?? 0} completed`,
        trend: "neutral" as const,
        icon: Building2,
        color: "text-violet-600",
        bg: "bg-violet-50",
      },
      {
        label: "Avg occupancy",
        value: overviewLoading ? "…" : `${occ}%`,
        change: "Active listings only",
        trend: "neutral" as const,
        icon: TrendingUp,
        color: "text-amber-600",
        bg: "bg-amber-50",
      },
    ];
  }, [
    overview,
    overviewLoading,
    overview?.activeTripCount,
    overview?.avgOccupancyPct,
    overview?.completedTripCount,
    overview?.confirmedBookingsCount,
    overview?.totalCollected,
  ]);

  const monthlyBars = overview?.monthlyCollectedLast6 ?? [];
  const maxMonthly =
    monthlyBars.length > 0 ? Math.max(...monthlyBars.map((m) => m.amount), 1) : 1;

  const topTrips = overview?.topTrips ?? [];

  const hostName =
    user?.name?.trim() ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "Partner";

  const needsStripe = hostNeedsStripeConnect(user);
  const stripeIncomplete = hostStripeIncomplete(user);

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {hostName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Live stats from your trips and bookings.
          </p>
          {overviewError ? (
            <p className="mt-2 text-sm text-destructive">{overviewError}</p>
          ) : null}
        </div>
        {needsStripe ? (
          <Button
            asChild
            variant="outline"
            className="gap-1.5 shrink-0 border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100"
          >
            <Link href="/partner/onboarding/stripe">
              <CreditCard className="h-4 w-4" />
              {stripeIncomplete ? "Complete Stripe setup" : "Connect Stripe to create trips"}
            </Link>
          </Button>
        ) : (
          <Button asChild className="gap-1.5 shrink-0">
            <Link href="/partner/trips/new">
              <Plus className="h-4 w-4" />
              New trip
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  stat.bg
                )}
              >
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <span className="text-xs text-muted-foreground text-right max-w-[140px] leading-snug">
                {stat.change}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-8">
        <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Collected revenue</h2>
              <p className="text-sm text-muted-foreground">
                Last 6 calendar months (booking dates)
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
              <Link href="/partner/payouts">
                Payouts
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {overviewLoading ? (
            <p className="text-sm text-muted-foreground py-8">Loading chart…</p>
          ) : monthlyBars.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8">
              No booking payments in the last six months yet.
            </p>
          ) : (
            <div className="flex items-end justify-between gap-2 h-32 mb-4">
              {monthlyBars.map((p) => {
                const height = maxMonthly > 0 ? (p.amount / maxMonthly) * 100 : 0;
                return (
                  <div key={p.monthKey} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex-1 flex items-end w-full">
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all bg-primary",
                          p.amount <= 0 && "bg-primary/20"
                        )}
                        style={{ height: `${Math.max(height, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {p.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Pending on active trips</p>
              <p className="text-xl font-bold text-amber-600">
                {overviewLoading
                  ? "…"
                  : formatCurrency(overview?.pendingCollected ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total collected</p>
              <p className="text-xl font-bold">
                {overviewLoading
                  ? "…"
                  : formatCurrency(overview?.totalCollected ?? 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold mb-1">Trip pipeline</h2>
          <p className="text-sm text-muted-foreground mb-5">Fast snapshot</p>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Active trips</span>
              <span className="font-semibold">
                {overviewLoading ? "…" : overview?.activeTripCount ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completed trips</span>
              <span className="font-semibold">
                {overviewLoading ? "…" : overview?.completedTripCount ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Legacy settled earnings</span>
              <span className="font-semibold tabular-nums">
                {overviewLoading
                  ? "…"
                  : formatCurrency(overview?.totalEarnings ?? 0)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t">
              “Settled earnings” counts payments tied to completed trips (matches the mobile app).
              “Total collected” includes all confirmed bookings.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Recent bookings</h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
              <Link href="/partner/bookings">
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {overviewLoading ? (
            <p className="text-sm text-muted-foreground py-4">Loading bookings…</p>
          ) : recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No bookings yet. When travelers book your trips, they&apos;ll show up here.
            </p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-full shrink-0">
                    <Image
                      src={booking.guestAvatar || "/placeholder.svg"}
                      alt={booking.guestName}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {booking.guestName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {booking.tripName}
                    </p>
                  </div>
                  <div className="hidden sm:block text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.checkIn).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.nights} nights
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                    <Badge
                      className={cn(
                        "text-[10px]",
                        getStatusColor(booking.status)
                      )}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Top trips</h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
              <Link href="/partner/trips">
                All trips
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {overviewLoading ? (
            <p className="text-sm text-muted-foreground py-4">Loading…</p>
          ) : topTrips.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Revenue by trip appears here once you have paid bookings.
            </p>
          ) : (
            <div className="space-y-4">
              {topTrips.slice(0, 3).map((listing, i) => (
                <Link
                  key={listing.tripId}
                  href={`/partner/trips/${encodeURIComponent(listing.tripId)}`}
                  className="block"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                      {i + 1}
                    </span>
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg shrink-0 bg-muted">
                      <Image
                        src={listing.coverImage || "/placeholder.svg"}
                        alt={listing.tripName}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {listing.tripName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(listing.revenue)} collected
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pl-9">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Share of your revenue</span>
                      <span className="font-medium tabular-nums">
                        {overview?.totalCollected &&
                        overview.totalCollected > 0
                          ? Math.round(
                              (listing.revenue / overview.totalCollected) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        overview?.totalCollected && overview.totalCollected > 0
                          ? (listing.revenue / overview.totalCollected) * 100
                          : 0
                      }
                      className="h-1"
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
