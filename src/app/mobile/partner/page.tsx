"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Sparkles,
  Users,
  Calendar,
  Star,
  DollarSign,
  MessageCircle,
  ChevronRight,
  Compass,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { PartnerBottomTabs } from "@/components/mobile/partner-bottom-tabs";
import { partnerTrips } from "@/data/partner-trips";
import {
  getUserPartnerTrips,
  subscribeToUserPartnerTrips,
} from "@/lib/user-partner-trips";
import {
  countUnreadBookings,
  subscribeToPartnerNotifications,
} from "@/lib/partner-notifications";
import { CURRENT_PARTNER } from "@/data/conversations";
import { cn } from "@/lib/utils";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function MobilePartnerDashboard() {
  const [userTrips, setUserTrips] = useState(getUserPartnerTrips());
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setUserTrips(getUserPartnerTrips());
    setUnread(countUnreadBookings());
    const refresh = () => {
      setUserTrips(getUserPartnerTrips());
      setUnread(countUnreadBookings());
    };
    const unsubA = subscribeToUserPartnerTrips(refresh);
    const unsubB = subscribeToPartnerNotifications(refresh);
    return () => {
      unsubA();
      unsubB();
    };
  }, []);

  // Merge user-created trips with seed partner trips (user ones first)
  const allTrips = useMemo(() => {
    const userIds = new Set(userTrips.map((t) => t.id));
    const seed = partnerTrips.filter((t) => !userIds.has(t.id));
    return [...userTrips, ...seed];
  }, [userTrips]);

  const stats = useMemo(() => {
    const published = allTrips.filter((t) => t.status === "published").length;
    const totalBookings = allTrips.reduce(
      (sum, t) => sum + t.currentBookings,
      0
    );
    const revenue = allTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);
    return { published, totalBookings, revenue };
  }, [allTrips]);

  return (
    <div className="relative flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title="Host dashboard"
        showBack={false}
        action={
          <Link
            href="/mobile/partner/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="Booking notifications"
          >
            <Bell className="h-4.5 w-4.5 text-foreground" />
            {unread > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white border-2 border-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-primary/10 via-white to-violet-500/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image
                src={CURRENT_PARTNER.avatar}
                alt={CURRENT_PARTNER.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground">
                Hi there, host
              </p>
              <p className="font-bold text-base truncate">
                {CURRENT_PARTNER.name}
              </p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 shrink-0">
              <Sparkles className="h-3 w-3" />
              Stripe ready
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 -mt-3 relative z-10">
          <div className="grid grid-cols-3 gap-2">
            <Stat
              icon={<Compass className="h-3.5 w-3.5 text-primary" />}
              label="Trips"
              value={String(stats.published)}
            />
            <Stat
              icon={<Users className="h-3.5 w-3.5 text-primary" />}
              label="Booked"
              value={String(stats.totalBookings)}
            />
            <Stat
              icon={<DollarSign className="h-3.5 w-3.5 text-primary" />}
              label="Revenue"
              value={formatMoney(stats.revenue)}
            />
          </div>
        </div>

        {/* Trips list */}
        <div className="px-5 mt-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">Your group trips</h2>
            <span className="text-[11px] text-muted-foreground">
              {allTrips.length} total
            </span>
          </div>

          {allTrips.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {allTrips.map((trip) => (
                <TripRow key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>

        {/* Cross-link to web partner portal for advanced features */}
        <div className="px-5 mt-5">
          <Link
            href="/partner"
            className="block rounded-2xl border border-dashed bg-white p-4 text-center"
          >
            <p className="text-xs font-semibold">
              More tools on the web dashboard
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Listings · Bookings · Calendar · Payouts · Surveys
            </p>
          </Link>
        </div>
      </div>

      {/* Floating create button (sits above the tab bar) */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <Button
          asChild
          size="lg"
          className="pointer-events-auto h-12 px-5 rounded-full shadow-xl gap-1.5"
        >
          <Link href="/mobile/partner/trips/new">
            <Plus className="h-4 w-4" />
            Create group trip
          </Link>
        </Button>
      </div>

      <PartnerBottomTabs />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white border p-3">
      <div className="flex items-center gap-1">
        {icon}
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </p>
      </div>
      <p className="mt-1 text-sm font-bold truncate">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border-2 border-dashed bg-white p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Compass className="h-5 w-5 text-primary" />
      </div>
      <p className="mt-3 font-semibold text-sm">No trips yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Create your first group adventure to get started.
      </p>
      <Button asChild className="mt-4 gap-1.5">
        <Link href="/mobile/partner/trips/new">
          <Plus className="h-4 w-4" />
          Create group trip
        </Link>
      </Button>
    </div>
  );
}

function TripRow({
  trip,
}: {
  trip: (typeof partnerTrips)[number];
}) {
  const fillPct = trip.maxGroupSize
    ? (trip.currentBookings / trip.maxGroupSize) * 100
    : 0;
  return (
    <Link
      href={`/mobile/partner/trips/${trip.id}`}
      className="flex gap-3 rounded-2xl bg-white border p-3"
    >
      <div className="relative h-16 w-16 overflow-hidden rounded-xl shrink-0 bg-muted">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Badge
            className={cn(
              "text-[9px] shrink-0 gap-1",
              trip.status === "published" &&
                "bg-emerald-100 text-emerald-800 border-emerald-200",
              trip.status === "draft" && "bg-muted text-muted-foreground",
              trip.status === "sold-out" &&
                "bg-amber-100 text-amber-800 border-amber-200"
            )}
          >
            {trip.status === "sold-out" ? "Sold out" : trip.status}
          </Badge>
          {trip.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              {trip.rating}
            </span>
          )}
        </div>
        <p className="font-semibold text-sm leading-tight line-clamp-1">
          {trip.title}
        </p>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
          <Calendar className="h-2.5 w-2.5" />
          {new Date(trip.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
          {" · "}
          {trip.durationDays}d
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground shrink-0">
            {trip.currentBookings}/{trip.maxGroupSize}
          </span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground self-center shrink-0" />
    </Link>
  );
}
