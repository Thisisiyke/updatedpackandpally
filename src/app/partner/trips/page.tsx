"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Calendar,
  Users,
  MoreVertical,
  Pencil,
  Eye,
  Copy,
  Trash2,
  Compass,
  Star,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { partnerTrips } from "@/data/partner-trips";
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
    case "published":
      return {
        label: "Published",
        class: "bg-emerald-100 text-emerald-800 border-emerald-200",
      };
    case "draft":
      return {
        label: "Draft",
        class: "bg-gray-100 text-gray-700 border-gray-200",
      };
    case "sold-out":
      return {
        label: "Sold Out",
        class: "bg-amber-100 text-amber-800 border-amber-200",
      };
    default:
      return { label: status, class: "" };
  }
}

export default function PartnerTripsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = partnerTrips.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (
      search &&
      !t.title.toLowerCase().includes(search.toLowerCase()) &&
      !t.destination.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const counts = {
    all: partnerTrips.length,
    published: partnerTrips.filter((t) => t.status === "published").length,
    draft: partnerTrips.filter((t) => t.status === "draft").length,
    "sold-out": partnerTrips.filter((t) => t.status === "sold-out").length,
  };

  const totalRevenue = partnerTrips.reduce((s, t) => s + t.revenue, 0);
  const totalBookings = partnerTrips.reduce((s, t) => s + t.currentBookings, 0);

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Group Trips
          </h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage curated group adventures
          </p>
        </div>
        <Button asChild className="gap-1.5 shrink-0">
          <Link href="/partner/trips/new">
            <Plus className="h-4 w-4" />
            Create Trip
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Total trips</p>
          <p className="text-2xl font-bold">{partnerTrips.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Published</p>
          <p className="text-2xl font-bold text-emerald-600">
            {counts.published}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Total bookings</p>
          <p className="text-2xl font-bold">{totalBookings}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1 rounded-lg border bg-white p-1 overflow-x-auto">
          {[
            { value: "all", label: "All" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Drafts" },
            { value: "sold-out", label: "Sold Out" },
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
              {tab.label} ({counts[tab.value as keyof typeof counts]})
            </button>
          ))}
        </div>
      </div>

      {/* Trips grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((trip) => {
            const statusConfig = getStatusConfig(trip.status);
            const fillPercent = (trip.currentBookings / trip.maxGroupSize) * 100;

            return (
              <div
                key={trip.id}
                className="group rounded-2xl border bg-white overflow-hidden transition-all hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={trip.coverImage}
                    alt={trip.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <Badge
                    className={cn("absolute top-3 left-3", statusConfig.class)}
                  >
                    {statusConfig.label}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white" />
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="absolute bottom-3 left-3 right-3 flex gap-1.5 flex-wrap">
                    {trip.category.map((c) => (
                      <Badge
                        key={c}
                        className="bg-black/60 text-white border-0 backdrop-blur-sm text-[10px]"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold leading-tight line-clamp-1">
                      {trip.title}
                    </h3>
                    {trip.reviewCount > 0 && (
                      <div className="flex items-center gap-0.5 text-xs shrink-0">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{trip.rating}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="h-3 w-3" />
                    {trip.destination}, {trip.country}
                  </p>

                  {/* Booking progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {trip.currentBookings}/{trip.maxGroupSize} booked
                      </span>
                      <span className="font-medium">{Math.round(fillPercent)}%</span>
                    </div>
                    <Progress value={fillPercent} className="h-1.5" />
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(trip.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground justify-end">
                      {trip.durationDays} days · {trip.difficulty}
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="font-bold">
                        {trip.revenue > 0
                          ? formatCurrency(trip.revenue)
                          : formatCurrency(trip.price) + "/person"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/partner/trips/${trip.id}`}>Manage</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Compass className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-bold mb-1">No trips yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {search
              ? "Try adjusting your search"
              : "Create your first group adventure"}
          </p>
          <Button asChild className="gap-1.5">
            <Link href="/partner/trips/new">
              <Plus className="h-4 w-4" />
              Create Trip
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
