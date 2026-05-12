"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Plane,
  Hotel as HotelIcon,
  Compass,
  Shield,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  XCircle,
  RefreshCw,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminBookings } from "@/data/admin";
import { FEATURE_FLAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
      return { label: "Confirmed", class: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    case "pending":
      return { label: "Pending", class: "bg-amber-100 text-amber-800 border-amber-200" };
    case "cancelled":
      return { label: "Cancelled", class: "bg-red-100 text-red-800 border-red-200" };
    case "completed":
      return { label: "Completed", class: "bg-blue-100 text-blue-800 border-blue-200" };
    case "disputed":
      return { label: "Disputed", class: "bg-red-100 text-red-800 border-red-200" };
    default:
      return { label: status, class: "" };
  }
}

function getRiskConfig(risk: string) {
  switch (risk) {
    case "high":
      return { label: "High", class: "text-red-600 bg-red-50", icon: AlertTriangle };
    case "medium":
      return { label: "Medium", class: "text-amber-600 bg-amber-50", icon: AlertTriangle };
    default:
      return { label: "Low", class: "text-emerald-600 bg-emerald-50", icon: Shield };
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "flight":
      return { icon: Plane, class: "text-blue-600" };
    case "hotel":
      return { icon: HotelIcon, class: "text-emerald-600" };
    case "trip":
      return { icon: Compass, class: "text-violet-600" };
    default:
      return { icon: Compass, class: "text-muted-foreground" };
  }
}

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Hide flight + hotel bookings while those surfaces are gated to "coming soon".
  // The only live booking type is group trips.
  const showFlights = FEATURE_FLAGS.publicFlightSearch;
  const showHotels = FEATURE_FLAGS.publicHotelSearch;
  const showTypeFilter = showFlights || showHotels;

  const sourceBookings = adminBookings.filter((b) => {
    if (b.type === "flight" && !showFlights) return false;
    if (b.type === "hotel" && !showHotels) return false;
    return true;
  });

  const filtered = sourceBookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (showTypeFilter && typeFilter !== "all" && b.type !== typeFilter)
      return false;
    if (
      search &&
      !b.id.toLowerCase().includes(search.toLowerCase()) &&
      !b.userName.toLowerCase().includes(search.toLowerCase()) &&
      !b.title.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const stats = {
    total: sourceBookings.length,
    revenue: sourceBookings
      .filter((b) => b.status !== "cancelled")
      .reduce((s, b) => s + b.amount, 0),
    disputed: sourceBookings.filter((b) => b.status === "disputed").length,
    highRisk: sourceBookings.filter((b) => b.riskScore === "high").length,
  };

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Bookings
          </h1>
          <p className="mt-1 text-muted-foreground">
            {showTypeFilter
              ? "All bookings across the platform"
              : "Group trip bookings · flights & hotels show up here once those integrations ship"}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Total bookings</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Disputed</p>
          <p className="text-2xl font-bold text-red-600">{stats.disputed}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">High risk</p>
          <p className="text-2xl font-bold text-amber-600">{stats.highRisk}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, user, or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {showTypeFilter && (
          <div className="flex gap-1 rounded-lg border bg-white p-1 overflow-x-auto">
            {[
              { value: "all", label: "All types" },
              ...(showFlights
                ? [{ value: "flight", label: "Flights" }]
                : []),
              ...(showHotels ? [{ value: "hotel", label: "Hotels" }] : []),
              { value: "trip", label: "Trips" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value)}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  typeFilter === tab.value
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-1 rounded-lg border bg-white p-1 overflow-x-auto">
          {[
            { value: "all", label: "All status" },
            { value: "confirmed", label: "Confirmed" },
            { value: "pending", label: "Pending" },
            { value: "disputed", label: "Disputed" },
          ].map((tab) => (
            <button
              key={tab.value}
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

      {/* Bookings table */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y">
            {filtered.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const riskConfig = getRiskConfig(booking.riskScore);
              const { icon: TypeIcon, class: typeClass } = getTypeIcon(booking.type);
              const RiskIcon = riskConfig.icon;

              return (
                <div
                  key={booking.id}
                  className="p-4 transition-colors hover:bg-muted/20"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    {/* ID & type */}
                    <div className="flex items-center gap-3 w-48 shrink-0">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg bg-muted",
                          typeClass
                        )}
                      >
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">
                          {booking.id}
                        </p>
                        <p className="text-xs font-medium capitalize">
                          {booking.type}
                        </p>
                      </div>
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Image
                        src={booking.userAvatar}
                        alt={booking.userName}
                        width={32}
                        height={32}
                        className="rounded-full object-cover h-8 w-8 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {booking.userName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {booking.title}
                        </p>
                      </div>
                    </div>

                    {/* Destination + partner */}
                    <div className="hidden xl:block flex-1 min-w-0">
                      <p className="text-sm truncate">{booking.destination}</p>
                      {booking.partnerName && (
                        <p className="text-xs text-muted-foreground truncate">
                          via {booking.partnerName}
                        </p>
                      )}
                    </div>

                    {/* Risk */}
                    <div className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                          riskConfig.class
                        )}
                      >
                        <RiskIcon className="h-3 w-3" />
                        {riskConfig.label}
                      </div>
                    </div>

                    {/* Status */}
                    <Badge className={cn("text-xs", statusConfig.class)}>
                      {statusConfig.label}
                    </Badge>

                    {/* Amount */}
                    <div className="text-right w-24 shrink-0">
                      <p className="font-bold">
                        {formatCurrency(booking.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-muted transition-colors outline-none">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4" />
                          Issue refund
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <XCircle className="h-4 w-4" />
                          Force cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center">
            <p className="font-semibold">No bookings found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
