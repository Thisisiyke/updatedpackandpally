"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Sparkles,
  Users,
  Calendar,
  Star,
  DollarSign,
  ChevronRight,
  Compass,
  Bell,
  Trash2,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { PartnerBottomTabs } from "@/components/mobile/partner-bottom-tabs";
import {
  getUserPartnerTrips,
  getHiddenTripIds,
  deleteUserPartnerTrip,
  saveUserPartnerTrip,
  subscribeToUserPartnerTrips,
} from "@/lib/user-partner-trips";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { wanderlyHostTripToPartnerTrip } from "@/lib/wanderly-partner-map";
import type { WanderlyTripRecord } from "@/lib/wanderly-trip-adapter";
import { partnerTrips, type PartnerTrip } from "@/data/partner-trips";
import {
  countUnreadBookings,
  subscribeToPartnerNotifications,
} from "@/lib/partner-notifications";
import { CURRENT_PARTNER } from "@/data/conversations";
import { cn } from "@/lib/utils";
import type { PartnerOverviewPayload } from "@/lib/partner-overview-types";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function MobilePartnerDashboard() {
  const router = useRouter();
  const { user } = usePackPallyAuth();
  const [userTrips, setUserTrips] = useState(getUserPartnerTrips());
  const [apiTrips, setApiTrips] = useState<PartnerTrip[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [unread, setUnread] = useState(0);
  const [overview, setOverview] = useState<PartnerOverviewPayload | null>(null);
  const [tripTab, setTripTab] = useState<"my" | "completed">("my");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setUserTrips(getUserPartnerTrips());
    setHiddenIds(getHiddenTripIds());
    setUnread(countUnreadBookings());
    const refresh = () => {
      setUserTrips(getUserPartnerTrips());
      setHiddenIds(getHiddenTripIds());
      setUnread(countUnreadBookings());
    };
    const unsubA = subscribeToUserPartnerTrips(refresh);
    const unsubB = subscribeToPartnerNotifications(refresh);
    return () => {
      unsubA();
      unsubB();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setApiTrips([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/partner/trips?userId=${encodeURIComponent(user.id)}&limit=50`)
      .then((r) => r.json())
      .then((d: { items?: WanderlyTripRecord[] }) => {
        if (cancelled || !Array.isArray(d.items)) return;
        setApiTrips(d.items.map((row) => wanderlyHostTripToPartnerTrip(row)));
      })
      .catch(() => {
        if (!cancelled) setApiTrips([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setOverview(null);
      return;
    }
    let cancelled = false;
    fetch("/api/partner/overview", { credentials: "include" })
      .then((r) => r.json())
      .then((d: PartnerOverviewPayload) => {
        if (!cancelled && d.status === "success") setOverview(d);
      })
      .catch(() => {
        if (!cancelled) setOverview(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  /** API + local drafts + seed listings; hide soft-deleted. */
  const allTrips = useMemo(() => {
    const fromApi = apiTrips;
    const idSet = new Set(fromApi.map((t) => t.id));
    const localOnly = userTrips.filter((t) => !idSet.has(t.id));
    const merged = [...fromApi, ...localOnly];
    const mergedIds = new Set(merged.map((t) => t.id));
    const seed = partnerTrips.filter((t) => !mergedIds.has(t.id));
    return [...merged, ...seed].filter((t) => !hiddenIds.has(t.id));
  }, [apiTrips, userTrips, hiddenIds]);

  const todayMs = Date.now();
  const myTrips = allTrips.filter(
    (t) => new Date(t.endDate).getTime() >= todayMs
  );
  const completedTrips = allTrips.filter(
    (t) => new Date(t.endDate).getTime() < todayMs
  );
  const visibleTrips = tripTab === "my" ? myTrips : completedTrips;

  const handleDelete = (trip: PartnerTrip) => {
    if (
      !confirm(
        `Delete "${trip.title}"? This removes it from your dashboard. Travelers who already booked won't be affected in this demo.`
      )
    )
      return;
    deleteUserPartnerTrip(trip.id);
    setToast("Trip deleted");
    setTimeout(() => setToast(null), 2200);
  };

  const handleRecreate = (trip: PartnerTrip) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() + 60);
    const end = new Date(start);
    end.setDate(end.getDate() + (trip.durationDays || 7));
    const newId = `utrip-${Date.now()}`;
    const cloned: PartnerTrip = {
      ...trip,
      id: newId,
      slug: `${trip.slug || "trip"}-${Date.now()}`,
      title: `${trip.title} (copy)`,
      status: "draft",
      currentBookings: 0,
      revenue: 0,
      rating: 0,
      reviewCount: 0,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };
    saveUserPartnerTrip(cloned);
    setToast("Trip recreated as a draft");
    setTimeout(() => setToast(null), 2400);
    router.push(`/mobile/partner/trips/${newId}`);
  };

  const stats = useMemo(() => {
    if (overview?.status === "success") {
      return {
        activeTrips: overview.activeTripCount ?? 0,
        totalBookings: overview.confirmedBookingsCount ?? 0,
        revenue: overview.totalCollected ?? 0,
      };
    }
    const published = allTrips.filter((t) => t.status === "published").length;
    const totalBookings = allTrips.reduce(
      (sum, t) => sum + t.currentBookings,
      0
    );
    const revenue = allTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);
    return {
      activeTrips: published,
      totalBookings,
      revenue,
    };
  }, [allTrips, overview]);

  const displayName =
    user?.name?.trim() ||
    (user?.email ? user.email.split("@")[0] : null) ||
    CURRENT_PARTNER.name;
  const avatarSrc =
    user?.image && user.image.length > 0 ? user.image : CURRENT_PARTNER.avatar;

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
                src={avatarSrc}
                alt={displayName}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground">
                Hi there, host
              </p>
              <p className="font-bold text-base truncate">{displayName}</p>
            </div>
            {user?.stripeId ? (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 shrink-0">
                <Sparkles className="h-3 w-3" />
                Stripe ready
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-muted-foreground gap-1 shrink-0 text-[10px]"
              >
                Connect Stripe
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 -mt-3 relative z-10">
          <div className="grid grid-cols-3 gap-2">
            <Stat
              icon={<Compass className="h-3.5 w-3.5 text-primary" />}
              label="Active"
              value={String(stats.activeTrips)}
            />
            <Stat
              icon={<Users className="h-3.5 w-3.5 text-primary" />}
              label="Booked"
              value={String(stats.totalBookings)}
            />
            <Stat
              icon={<DollarSign className="h-3.5 w-3.5 text-primary" />}
              label="Collected"
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

          {/* My / Completed tabs */}
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg border bg-muted/40 p-1">
            <button
              type="button"
              onClick={() => setTripTab("my")}
              className={cn(
                "rounded-md py-1.5 text-xs font-semibold transition-colors",
                tripTab === "my"
                  ? "bg-white shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              My trips ({myTrips.length})
            </button>
            <button
              type="button"
              onClick={() => setTripTab("completed")}
              className={cn(
                "rounded-md py-1.5 text-xs font-semibold transition-colors",
                tripTab === "completed"
                  ? "bg-white shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              Completed ({completedTrips.length})
            </button>
          </div>

          {visibleTrips.length === 0 ? (
            tripTab === "completed" ? (
              <div className="rounded-2xl border border-dashed bg-white p-6 text-center text-xs text-muted-foreground">
                No completed trips yet — once a trip&apos;s end date passes,
                it&apos;ll move here.
              </div>
            ) : (
              <EmptyState />
            )
          ) : (
            <div className="space-y-3">
              {visibleTrips.map((trip) => (
                <TripRow
                  key={trip.id}
                  trip={trip}
                  variant={tripTab === "my" ? "active" : "completed"}
                  onDelete={() => handleDelete(trip)}
                  onRecreate={() => handleRecreate(trip)}
                />
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

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-white shadow-lg animate-[fade-in-up_300ms_ease-out]">
          {toast}
        </div>
      )}

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
  variant,
  onDelete,
  onRecreate,
}: {
  trip: PartnerTrip;
  variant: "active" | "completed";
  onDelete: () => void;
  onRecreate: () => void;
}) {
  const fillPct = trip.maxGroupSize
    ? (trip.currentBookings / trip.maxGroupSize) * 100
    : 0;
  return (
    <div className="rounded-2xl bg-white border overflow-hidden">
      <Link
        href={`/mobile/partner/trips/${trip.id}`}
        className="flex gap-3 p-3"
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
                variant === "completed" &&
                  "bg-blue-100 text-blue-800 border-blue-200",
                variant === "active" &&
                  trip.status === "published" &&
                  "bg-emerald-100 text-emerald-800 border-emerald-200",
                variant === "active" &&
                  trip.status === "draft" &&
                  "bg-muted text-muted-foreground",
                variant === "active" &&
                  trip.status === "sold-out" &&
                  "bg-amber-100 text-amber-800 border-amber-200"
              )}
            >
              {variant === "completed"
                ? "Completed"
                : trip.status === "sold-out"
                ? "Sold out"
                : trip.status}
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

      {/* Per-tab action footer */}
      <div className="border-t flex">
        {variant === "active" ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Delete trip
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRecreate();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-primary hover:bg-primary/5 transition-colors"
          >
            <RotateCw className="h-3 w-3" />
            Recreate trip
          </button>
        )}
      </div>
    </div>
  );
}
