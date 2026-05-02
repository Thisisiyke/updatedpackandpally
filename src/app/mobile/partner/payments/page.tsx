"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { PartnerBottomTabs } from "@/components/mobile/partner-bottom-tabs";
import { StripeAccountCard } from "@/components/partner/stripe-account-card";
import { partnerTrips } from "@/data/partner-trips";
import {
  getUserPartnerTrips,
  subscribeToUserPartnerTrips,
} from "@/lib/user-partner-trips";
import {
  getBookingsForTrip,
  getTripPaymentStats,
} from "@/lib/partner-bookings";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function nextPayoutDate() {
  // Mock: next Friday at most 7 days away
  const now = new Date();
  const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilFriday);
  return next.toISOString();
}

export default function MobilePartnerPaymentsPage() {
  const [userTrips, setUserTrips] = useState(getUserPartnerTrips());
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [stripeConnectedAt, setStripeConnectedAt] = useState<string | null>(
    null
  );

  useEffect(() => {
    setUserTrips(getUserPartnerTrips());
    setStripeAccountId(localStorage.getItem("packpally_stripe_account_id"));
    setStripeConnectedAt(
      localStorage.getItem("packpally_stripe_connected_at")
    );
    return subscribeToUserPartnerTrips(() =>
      setUserTrips(getUserPartnerTrips())
    );
  }, []);

  const allTrips = useMemo(() => {
    const userIds = new Set(userTrips.map((t) => t.id));
    const seed = partnerTrips.filter((t) => !userIds.has(t.id));
    return [...userTrips, ...seed];
  }, [userTrips]);

  const perTrip = useMemo(() => {
    return allTrips.map((t) => {
      const bookings = getBookingsForTrip(t.id);
      const stats = getTripPaymentStats(bookings);
      // Combine seed-derived booking revenue with the existing trip.revenue mock.
      const collected = stats.totalCollected || t.revenue || 0;
      return {
        trip: t,
        bookings,
        stats,
        collected,
      };
    });
  }, [allTrips]);

  const totals = useMemo(() => {
    return perTrip.reduce(
      (acc, p) => {
        acc.collected += p.collected;
        acc.outstanding += p.stats.totalOutstanding;
        acc.travelers += p.stats.totalTravelers;
        return acc;
      },
      { collected: 0, outstanding: 0, travelers: 0 }
    );
  }, [perTrip]);

  // Pretend the last 80% of collected has already been paid out; the rest is "next payout"
  const lifetimePayout = Math.round(totals.collected * 0.8);
  const nextPayoutAmount = totals.collected - lifetimePayout;
  const nextPayout = nextPayoutDate();

  return (
    <div className="relative flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Payments" showBack={false} />

      <div className="flex-1 overflow-y-auto pb-2">
        {/* Earnings hero */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-violet-600 text-white px-5 py-6">
          <p className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
            Lifetime earnings
          </p>
          <p className="mt-1 text-4xl font-extrabold tracking-tight tabular-nums">
            {formatMoney(totals.collected)}
          </p>
          <p className="mt-1 text-xs text-white/80 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            From {totals.travelers} traveler{totals.travelers === 1 ? "" : "s"}{" "}
            across {perTrip.length} trip{perTrip.length === 1 ? "" : "s"}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">
                Next payout
              </p>
              <p className="mt-0.5 font-bold">
                {formatMoney(nextPayoutAmount)}
              </p>
              <p className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
                <Calendar className="h-2.5 w-2.5" />
                {formatDate(nextPayout)}
              </p>
            </div>
            <div className="rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 p-3">
              <p className="text-[10px] uppercase tracking-wider text-white/70 font-semibold">
                Outstanding
              </p>
              <p className="mt-0.5 font-bold">
                {formatMoney(totals.outstanding)}
              </p>
              <p className="text-[10px] text-white/80 mt-0.5">
                In partial payments
              </p>
            </div>
          </div>
        </div>

        {/* Stripe account card */}
        <div className="px-5 mt-5">
          <StripeAccountCard
            accountId={stripeAccountId}
            connectedAt={stripeConnectedAt}
          />
        </div>

        {/* Per-trip breakdown */}
        <div className="px-5 mt-5">
          <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5">
            <Wallet className="h-4 w-4" />
            Earnings by trip
          </h2>
          {perTrip.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-center text-xs text-muted-foreground">
              No trips yet. Earnings will appear here once travelers book.
            </div>
          ) : (
            <div className="space-y-2">
              {perTrip.map(({ trip, stats, collected }) => (
                <Link
                  key={trip.id}
                  href={`/mobile/partner/trips/${trip.id}/travelers`}
                  className="block rounded-2xl border bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {trip.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {stats.totalTravelers}/{trip.maxGroupSize} traveler
                        {stats.totalTravelers === 1 ? "" : "s"} · {stats.totalBookings} booking
                        {stats.totalBookings === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-base">
                        {formatMoney(collected)}
                      </p>
                      {stats.totalOutstanding > 0 && (
                        <p className="text-[10px] text-amber-700 flex items-center justify-end gap-0.5 mt-0.5">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {formatMoney(stats.totalOutstanding)} pending
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground self-center shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Cross-link to web payouts */}
        <div className="px-5 mt-4">
          <Link
            href="/partner/payouts"
            className="block rounded-2xl border border-dashed bg-white p-3 text-center"
          >
            <p className="text-xs font-semibold">Full payout history on web</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Per-transaction details · CSV export
            </p>
          </Link>
        </div>
      </div>

      <PartnerBottomTabs />
    </div>
  );
}
