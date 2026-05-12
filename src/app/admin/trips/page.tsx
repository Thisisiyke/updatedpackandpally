"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Compass,
  Globe,
  Lock,
  Users,
  Calendar,
  Star,
  Eye,
  Ban,
  RotateCcw,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { partnerTrips, type PartnerTrip } from "@/data/partner-trips";
import { getUserPartnerTrips, subscribeToUserPartnerTrips } from "@/lib/user-partner-trips";
import {
  getSuspendedTripIds,
  toggleTripSuspension,
  subscribeToSuspensions,
} from "@/lib/admin-suspensions";
import { cn } from "@/lib/utils";

type VisFilter = "all" | "public" | "private";
type StatusFilter = "all" | "published" | "draft" | "sold-out" | "suspended";

export default function AdminTripsPage() {
  const [search, setSearch] = useState("");
  const [vis, setVis] = useState<VisFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [userTrips, setUserTrips] = useState<PartnerTrip[]>([]);
  const [suspendedIds, setSuspendedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setUserTrips(getUserPartnerTrips());
    setSuspendedIds(getSuspendedTripIds());
    const offTrips = subscribeToUserPartnerTrips(() => {
      setUserTrips(getUserPartnerTrips());
    });
    const offSusp = subscribeToSuspensions(() => {
      setSuspendedIds(getSuspendedTripIds());
    });
    return () => {
      offTrips();
      offSusp();
    };
  }, []);

  const allTrips = useMemo(() => {
    const userIds = new Set(userTrips.map((t) => t.id));
    const seed = partnerTrips.filter((t) => !userIds.has(t.id));
    return [...userTrips, ...seed];
  }, [userTrips]);

  const counts = useMemo(() => {
    const total = allTrips.length;
    const pub = allTrips.filter(
      (t) => (t.visibility ?? "public") === "public"
    ).length;
    const priv = allTrips.filter((t) => t.visibility === "private").length;
    const susp = allTrips.filter((t) => suspendedIds.has(t.id)).length;
    return { total, pub, priv, susp };
  }, [allTrips, suspendedIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allTrips.filter((t) => {
      if (vis === "public" && (t.visibility ?? "public") !== "public")
        return false;
      if (vis === "private" && t.visibility !== "private") return false;
      if (status === "suspended" && !suspendedIds.has(t.id)) return false;
      if (
        status !== "all" &&
        status !== "suspended" &&
        t.status !== status
      )
        return false;
      if (
        q &&
        !t.title.toLowerCase().includes(q) &&
        !t.destination.toLowerCase().includes(q) &&
        !t.country.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [allTrips, search, vis, status, suspendedIds]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleToggleSuspend = (trip: PartnerTrip) => {
    const wasSuspended = suspendedIds.has(trip.id);
    if (
      !wasSuspended &&
      !confirm(
        `Take down "${trip.title}"? Travelers won't be able to discover or book it until reinstated.`
      )
    ) {
      return;
    }
    const nowSuspended = toggleTripSuspension(trip.id);
    showToast(nowSuspended ? "Trip taken down" : "Trip reinstated");
  };

  return (
    <div className="p-6 lg:p-10">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg animate-[fade-in-up_300ms_ease-out]">
          <CheckCircle2 className="h-4 w-4" />
          {toast}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Group Trips
        </h1>
        <p className="mt-1 text-muted-foreground">
          Every group trip published on Pack &amp; Pally — public and private.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Tile icon={Compass} label="All trips" value={counts.total} />
        <Tile
          icon={Globe}
          label="Public"
          value={counts.pub}
          accent="text-emerald-700"
        />
        <Tile
          icon={Lock}
          label="Private"
          value={counts.priv}
          accent="text-amber-700"
        />
        <Tile
          icon={Ban}
          label="Suspended"
          value={counts.susp}
          accent="text-red-700"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-white p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, destination, country…"
            className="pl-9"
          />
        </div>

        <SegPicker
          label="Visibility"
          options={[
            { v: "all" as const, l: "All" },
            { v: "public" as const, l: "Public" },
            { v: "private" as const, l: "Private" },
          ]}
          value={vis}
          onChange={setVis}
        />
        <SegPicker
          label="Status"
          options={[
            { v: "all" as const, l: "All" },
            { v: "published" as const, l: "Published" },
            { v: "draft" as const, l: "Draft" },
            { v: "sold-out" as const, l: "Sold out" },
            { v: "suspended" as const, l: "Suspended" },
          ]}
          value={status}
          onChange={setStatus}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="hidden md:grid grid-cols-[3fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 border-b bg-muted/30 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          <span>Trip</span>
          <span>Visibility</span>
          <span>Status</span>
          <span>Bookings</span>
          <span>Rating</span>
          <span className="text-right">Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-semibold">No trips match your filters</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try clearing search or switching the visibility / status filter.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((t) => {
              const visibility = t.visibility ?? "public";
              const isSuspended = suspendedIds.has(t.id);
              return (
                <div
                  key={t.id}
                  className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-3 items-center"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-12 w-16 overflow-hidden rounded-lg shrink-0 bg-muted">
                      {t.coverImage && (
                        <Image
                          src={t.coverImage}
                          alt={t.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {t.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {t.destination}, {t.country}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Badge
                      className={cn(
                        "gap-1 text-[10px]",
                        visibility === "private"
                          ? "bg-amber-100 text-amber-900 border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border-emerald-200"
                      )}
                    >
                      {visibility === "private" ? (
                        <Lock className="h-2.5 w-2.5" />
                      ) : (
                        <Globe className="h-2.5 w-2.5" />
                      )}
                      {visibility}
                    </Badge>
                  </div>

                  <div>
                    {isSuspended ? (
                      <Badge className="text-[10px] bg-red-100 text-red-800 border-red-200">
                        Suspended
                      </Badge>
                    ) : (
                      <Badge
                        className={cn(
                          "text-[10px] capitalize",
                          t.status === "published" &&
                            "bg-emerald-100 text-emerald-800 border-emerald-200",
                          t.status === "draft" &&
                            "bg-gray-100 text-gray-700 border-gray-200",
                          t.status === "sold-out" &&
                            "bg-amber-100 text-amber-800 border-amber-200"
                        )}
                      >
                        {t.status === "sold-out" ? "Sold out" : t.status}
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-semibold text-foreground">
                      {t.currentBookings}
                    </span>
                    /{t.maxGroupSize}
                  </div>

                  <div className="text-sm flex items-center gap-1 text-muted-foreground">
                    {t.reviewCount > 0 ? (
                      <>
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-foreground">
                          {t.rating}
                        </span>
                        <span className="text-xs">({t.reviewCount})</span>
                      </>
                    ) : (
                      <span className="text-xs">—</span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-1 h-8"
                    >
                      <Link href={`/partner/trips/${t.id}/preview`}>
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant={isSuspended ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => handleToggleSuspend(t)}
                      className="gap-1 h-8"
                    >
                      {isSuspended ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reinstate
                        </>
                      ) : (
                        <>
                          <Ban className="h-3.5 w-3.5" />
                          Take down
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="md:hidden flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(t.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {t.durationDays}d
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Compass;
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        <Icon className={cn("h-3.5 w-3.5", accent || "text-primary")} />
        {label}
      </div>
      <p className={cn("mt-2 text-2xl font-bold", accent)}>{value}</p>
    </div>
  );
}

function SegPicker<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { v: T; l: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
        {label}
      </p>
      <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              value === o.v
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}
