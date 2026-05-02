"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Calendar,
  Users,
  MapPin,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import {
  wanderlyItemToPartnerTripBookingRow,
  type PartnerTripBookingRow,
} from "@/lib/wanderly-partner-map";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusConfig(status: string) {
  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        class: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: CheckCircle2,
      };
    case "pending":
      return {
        label: "Pending",
        class: "bg-amber-100 text-amber-800 border-amber-200",
        icon: Clock,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        class: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
      };
    case "completed":
      return {
        label: "Completed",
        class: "bg-blue-100 text-blue-800 border-blue-200",
        icon: CheckCircle2,
      };
    default:
      return { label: status, class: "", icon: Clock };
  }
}

export default function PartnerBookingsPage() {
  const { user } = usePackPallyAuth();
  const [rows, setRows] = useState<PartnerTripBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user?.id) {
      setRows([]);
      setLoading(false);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetch(
      `/api/partner/bookings/aggregate?userId=${encodeURIComponent(user.id)}`,
      { credentials: "include" }
    )
      .then(async (r) => {
        const d = (await r.json().catch(() => ({}))) as {
          bookings?: Record<string, unknown>[];
          error?: string;
        };
        if (!r.ok) {
          throw new Error(d.error || "Failed to load bookings");
        }
        if (cancelled) return;
        if (!Array.isArray(d.bookings)) {
          setRows([]);
          return;
        }
        setRows(d.bookings.map((b) => wanderlyItemToPartnerTripBookingRow(b)));
      })
      .catch((e) => {
        if (!cancelled) {
          setRows([]);
          setLoadError(
            e instanceof Error ? e.message : "Could not load bookings"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const filtered = rows.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (
      search &&
      !b.guestName.toLowerCase().includes(search.toLowerCase()) &&
      !b.id.toLowerCase().includes(search.toLowerCase()) &&
      !b.tripName.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const counts = {
    all: rows.length,
    confirmed: rows.filter((b) => b.status === "confirmed").length,
    pending: rows.filter((b) => b.status === "pending").length,
    completed: rows.filter((b) => b.status === "completed").length,
    cancelled: rows.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Bookings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Group trip reservations from your hosted trips in Wanderly.
        </p>
      </div>

      {loadError && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{counts.all}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{counts.pending}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Confirmed</p>
          <p className="text-2xl font-bold text-emerald-600">
            {counts.confirmed}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-2xl font-bold">
            {formatCurrency(
              rows
                .filter((b) => b.status !== "cancelled")
                .reduce((s, b) => s + b.totalPrice, 0)
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest, trip, or booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 rounded-lg border bg-white p-1 overflow-x-auto">
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "confirmed", label: "Confirmed" },
            { value: "completed", label: "Past" },
            { value: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === tab.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-white overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-muted-foreground">
            Loading bookings…
          </div>
        ) : filtered.length > 0 ? (
          <div className="divide-y">
            {filtered.map((booking) => {
              const config = getStatusConfig(booking.status);
              const Icon = config.icon;
              const startValid =
                booking.checkIn && !Number.isNaN(new Date(booking.checkIn).getTime());

              return (
                <div
                  key={booking.id}
                  className="p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Image
                        src={booking.guestAvatar || "/placeholder.svg"}
                        alt={booking.guestName}
                        width={44}
                        height={44}
                        className="rounded-full object-cover h-11 w-11 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">
                            {booking.guestName}
                          </p>
                          <Badge
                            className={cn(
                              "text-[10px] shrink-0",
                              config.class
                            )}
                          >
                            <Icon className="h-2.5 w-2.5 mr-0.5" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {booking.guestEmail} · #{booking.id}
                        </p>
                      </div>
                    </div>

                    <div className="hidden lg:block min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {booking.tripRouteId ? (
                          <Link
                            href={`/partner/trips/${encodeURIComponent(booking.tripRouteId)}/travelers`}
                            className="hover:underline"
                          >
                            {booking.tripName}
                          </Link>
                        ) : (
                          booking.tripName
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {booking.roomTypeLabel}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Start
                        </p>
                        <p className="font-semibold">
                          {startValid
                            ? new Date(booking.checkIn).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Travelers
                        </p>
                        <p className="font-semibold">
                          {booking.guests}
                          {booking.nights > 0 ? ` · ${booking.nights}n` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold">
                        {formatCurrency(booking.totalPrice)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Booked{" "}
                        {new Date(booking.bookedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {booking.status === "pending" && (
                        <>
                          <Button size="sm" className="h-8 text-xs">
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center">
            <p className="font-semibold">
              {loadError
                ? "No bookings to show"
                : rows.length === 0
                  ? "No bookings yet"
                  : "No bookings match your search"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {loadError
                ? "Fix the error above and refresh, or check back later."
                : rows.length === 0
                  ? "When travelers book your trips, they will appear here."
                  : "Try adjusting your search or filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
