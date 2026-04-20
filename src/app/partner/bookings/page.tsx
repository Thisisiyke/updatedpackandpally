"use client";

import { useState } from "react";
import Image from "next/image";
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
import { partnerListings, partnerBookings } from "@/data/partner-listings";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = partnerBookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (
      search &&
      !b.guestName.toLowerCase().includes(search.toLowerCase()) &&
      !b.id.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const counts = {
    all: partnerBookings.length,
    confirmed: partnerBookings.filter((b) => b.status === "confirmed").length,
    pending: partnerBookings.filter((b) => b.status === "pending").length,
    completed: partnerBookings.filter((b) => b.status === "completed").length,
    cancelled: partnerBookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Bookings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage guest reservations across all your listings
        </p>
      </div>

      {/* Stats */}
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
              partnerBookings
                .filter((b) => b.status !== "cancelled")
                .reduce((s, b) => s + b.totalPrice, 0)
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest name or booking ID..."
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

      {/* Bookings list */}
      <div className="rounded-2xl border bg-white overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y">
            {filtered.map((booking) => {
              const listing = partnerListings.find(
                (l) => l.id === booking.listingId
              );
              const config = getStatusConfig(booking.status);
              const Icon = config.icon;

              return (
                <div
                  key={booking.id}
                  className="p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    {/* Guest info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Image
                        src={booking.guestAvatar}
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

                    {/* Listing info */}
                    <div className="hidden lg:block min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {listing?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {booking.roomType}
                      </p>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Check-in
                        </p>
                        <p className="font-semibold">
                          {new Date(booking.checkIn).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Guests
                        </p>
                        <p className="font-semibold">
                          {booking.guests} · {booking.nights}n
                        </p>
                      </div>
                    </div>

                    {/* Price */}
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

                    {/* Actions */}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
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
