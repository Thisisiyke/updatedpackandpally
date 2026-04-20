"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Users,
  DollarSign,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Building2,
  UserPlus,
  ShoppingCart,
  RefreshCw,
  Star,
  CheckCircle2,
  XCircle,
  Activity,
  ShieldAlert,
  TrendingUp,
  CheckCheck,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAdminStats,
  activityFeed,
  adminDisputes,
  adminPartners,
} from "@/data/admin";
import { cn } from "@/lib/utils";

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}k`;
  }
  return `$${amount}`;
}

function getActivityIcon(type: string) {
  switch (type) {
    case "signup":
      return { icon: UserPlus, color: "text-blue-600", bg: "bg-blue-50" };
    case "booking":
      return { icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-50" };
    case "cancellation":
      return { icon: XCircle, color: "text-red-600", bg: "bg-red-50" };
    case "refund-request":
      return { icon: RefreshCw, color: "text-amber-600", bg: "bg-amber-50" };
    case "partner-application":
      return { icon: Building2, color: "text-violet-600", bg: "bg-violet-50" };
    case "review":
      return { icon: Star, color: "text-amber-600", bg: "bg-amber-50" };
    case "listing-published":
      return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" };
    case "payout":
      return { icon: DollarSign, color: "text-primary", bg: "bg-primary/10" };
    default:
      return { icon: Activity, color: "text-muted-foreground", bg: "bg-muted" };
  }
}

export default function AdminOverviewPage() {
  const stats = getAdminStats();
  const urgentDisputes = adminDisputes
    .filter((d) => d.priority === "urgent" || d.priority === "high")
    .filter((d) => d.status === "open" || d.status === "in-review")
    .slice(0, 3);
  const pendingPartners = adminPartners.filter((p) => p.status === "pending");

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newUsersToday} today`,
      trend: "up" as const,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Gross Booking Value",
      value: formatCurrency(stats.gmv),
      change: "+12.4%",
      trend: "up" as const,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      change: `+${stats.bookingsToday} today`,
      trend: "up" as const,
      icon: Calendar,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Open Disputes",
      value: stats.openDisputes,
      change: `${stats.urgentDisputes} urgent`,
      trend: "down" as const,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Platform Overview
          </h1>
          <p className="mt-1 text-muted-foreground flex items-center gap-2">
            <CircleDot className="h-3 w-3 text-emerald-500 fill-emerald-500" />
            All systems operational · {stats.platformHealth}% uptime
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm">
            Export report
          </Button>
          <Button size="sm">Send announcement</Button>
        </div>
      </div>

      {/* Stats */}
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
            </div>
            <p className="mt-3 text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Financial snapshot + Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-8">
        {/* Financial snapshot */}
        <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Financial snapshot</h2>
              <p className="text-sm text-muted-foreground">This month</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 border border-emerald-200/50">
              <p className="text-xs font-medium text-emerald-700">
                GMV this month
              </p>
              <p className="text-2xl font-bold text-emerald-900 mt-2">
                {formatCurrency(stats.gmvThisMonth)}
              </p>
              <p className="text-xs text-emerald-600 mt-1">+18% vs last month</p>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/20">
              <p className="text-xs font-medium text-primary">
                Commission earned
              </p>
              <p className="text-2xl font-bold text-primary mt-2">
                {formatCurrency(stats.commissionThisMonth)}
              </p>
              <p className="text-xs text-primary/70 mt-1">15% avg take rate</p>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 border border-amber-200/50">
              <p className="text-xs font-medium text-amber-700">
                Pending refunds
              </p>
              <p className="text-2xl font-bold text-amber-900 mt-2">
                {formatCurrency(stats.pendingRefunds)}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Across {stats.openDisputes} disputes
              </p>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total lifetime: </span>
                <span className="font-bold">{formatCurrency(stats.gmv)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Commission: </span>
                <span className="font-bold">
                  {formatCurrency(stats.commission)}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              Full report
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold">Live activity</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-time
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[360px] overflow-y-auto">
            {activityFeed.map((event) => {
              const { icon: Icon, color, bg } = getActivityIcon(event.type);
              return (
                <div key={event.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full shrink-0",
                      bg
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {event.actor}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {event.timestamp}
                      {event.amount && ` · $${event.amount.toLocaleString()}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action items */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Urgent disputes */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                Urgent disputes
              </h2>
              <p className="text-sm text-muted-foreground">
                Needs your attention
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
              <Link href="/admin/disputes">
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {urgentDisputes.length > 0 ? (
            <div className="space-y-3">
              {urgentDisputes.map((d) => (
                <Link
                  key={d.id}
                  href="/admin/disputes"
                  className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/30"
                >
                  <Image
                    src={d.userAvatar}
                    alt={d.userName}
                    width={36}
                    height={36}
                    className="rounded-full object-cover h-9 w-9 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold truncate">
                        {d.userName}
                      </p>
                      <Badge
                        className={cn(
                          "text-[10px] shrink-0",
                          d.priority === "urgent"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        )}
                      >
                        {d.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {d.reason}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">
                      ${d.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-red-600">SLA: {d.slaHours}h</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CheckCheck className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold">All caught up!</p>
              <p className="text-xs text-muted-foreground">No urgent disputes</p>
            </div>
          )}
        </div>

        {/* Pending partners */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-violet-500" />
                Partner applications
              </h2>
              <p className="text-sm text-muted-foreground">
                {pendingPartners.length} awaiting review
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-muted-foreground">
              <Link href="/admin/partners">
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {pendingPartners.length > 0 ? (
            <div className="space-y-3">
              {pendingPartners.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border p-3"
                >
                  <Image
                    src={p.avatar}
                    alt={p.name}
                    width={36}
                    height={36}
                    className="rounded-full object-cover h-9 w-9 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.company} · {p.country}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CheckCheck className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold">All processed</p>
              <p className="text-xs text-muted-foreground">No pending applications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
