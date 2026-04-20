"use client";

import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  Calendar,
  Building2,
  TrendingUp,
  Star,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  partnerListings,
  partnerBookings,
  partnerPayouts,
  getPartnerStats,
} from "@/data/partner-listings";
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
  const stats = getPartnerStats();
  const recentBookings = [...partnerBookings]
    .sort(
      (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
    )
    .slice(0, 5);
  const topListings = partnerListings
    .filter((l) => l.status === "published")
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
    .slice(0, 3);

  const statCards = [
    {
      label: "Total revenue",
      value: formatCurrency(stats.totalRevenue),
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total bookings",
      value: stats.totalBookings,
      change: "+8",
      trend: "up" as const,
      icon: Calendar,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Active listings",
      value: stats.activeListings,
      change: `${partnerListings.length - stats.activeListings} inactive`,
      trend: "neutral" as const,
      icon: Building2,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Avg occupancy",
      value: `${stats.avgOccupancy}%`,
      change: "+5%",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, Partner
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening with your properties today.
          </p>
        </div>
        <Button asChild className="gap-1.5 shrink-0">
          <Link href="/partner/listings/new">
            <Plus className="h-4 w-4" />
            Add Listing
          </Link>
        </Button>
      </div>

      {/* Stats grid */}
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
              {stat.trend !== "neutral" && (
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    stat.trend === "up" ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              )}
              {stat.trend === "neutral" && (
                <span className="text-xs text-muted-foreground">
                  {stat.change}
                </span>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue & rating row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-8">
        {/* Earnings summary */}
        <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Earnings</h2>
              <p className="text-sm text-muted-foreground">
                Last 6 months payouts
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
              <Link href="/partner/payouts">
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Simple bar chart */}
          <div className="flex items-end justify-between gap-2 h-32 mb-4">
            {partnerPayouts
              .slice(0, 6)
              .reverse()
              .map((p) => {
                const max = Math.max(
                  ...partnerPayouts.slice(0, 6).map((x) => x.amount)
                );
                const height = (p.amount / max) * 100;
                return (
                  <div key={p.id} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex-1 flex items-end w-full">
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all",
                          p.status === "paid" ? "bg-primary" : "bg-primary/30"
                        )}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {p.period.split(" ")[0].slice(0, 3)}
                    </span>
                  </div>
                );
              })}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Pending payout</p>
              <p className="text-xl font-bold text-amber-600">
                {formatCurrency(stats.pendingRevenue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total earned</p>
              <p className="text-xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        {/* Rating card */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-bold mb-1">Guest satisfaction</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Average across listings
          </p>

          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-muted/30"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  className="text-amber-400"
                  stroke="currentColor"
                  style={{
                    strokeDasharray: 377,
                    strokeDashoffset: 377 - (stats.avgRating / 5) * 377,
                    transform: "rotate(-90deg)",
                    transformOrigin: "center",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-3xl font-bold">{stats.avgRating}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i <= Math.round(stats.avgRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Based on {partnerListings.reduce((s, l) => s + l.reviewCount, 0).toLocaleString()} reviews
          </p>
        </div>
      </div>

      {/* Recent bookings & top listings */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent bookings */}
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

          <div className="space-y-3">
            {recentBookings.map((booking) => {
              const listing = partnerListings.find(
                (l) => l.id === booking.listingId
              );
              return (
                <div
                  key={booking.id}
                  className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-full shrink-0">
                    <Image
                      src={booking.guestAvatar}
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
                      {listing?.name}
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
              );
            })}
          </div>
        </div>

        {/* Top listings */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Top listings</h2>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
              <Link href="/partner/listings">
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {topListings.map((listing, i) => (
              <Link
                key={listing.id}
                href={`/partner/listings/${listing.id}`}
                className="block"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                    {i + 1}
                  </span>
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg shrink-0">
                    <Image
                      src={listing.coverImage}
                      alt={listing.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {listing.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(listing.monthlyRevenue)}/mo
                    </p>
                  </div>
                </div>
                <div className="mt-2 pl-9">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium">
                      {listing.occupancyRate}%
                    </span>
                  </div>
                  <Progress value={listing.occupancyRate} className="h-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
