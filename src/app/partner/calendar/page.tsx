"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Lock, DollarSign, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { partnerListings, partnerBookings } from "@/data/partner-listings";
import { cn } from "@/lib/utils";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function PartnerCalendarPage() {
  const [selectedListingId, setSelectedListingId] = useState(
    partnerListings[0]?.id || ""
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());

  const selectedListing = partnerListings.find(
    (l) => l.id === selectedListingId
  );
  const listingBookings = partnerBookings.filter(
    (b) => b.listingId === selectedListingId && b.status !== "cancelled"
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const bookedDates = useMemo(() => {
    const dates = new Set<string>();
    listingBookings.forEach((b) => {
      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        dates.add(d.toISOString().split("T")[0]);
      }
    });
    return dates;
  }, [listingBookings]);

  const getDateKey = (day: number) => {
    return new Date(year, month, day).toISOString().split("T")[0];
  };

  const toggleBlock = (day: number) => {
    const key = getDateKey(day);
    if (bookedDates.has(key)) return;
    const next = new Set(blockedDates);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setBlockedDates(next);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getBookingForDate = (day: number) => {
    const key = getDateKey(day);
    return listingBookings.find((b) => {
      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      const current = new Date(year, month, day);
      return current >= start && current < end;
    });
  };

  const upcomingBookings = [...listingBookings]
    .sort(
      (a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime()
    )
    .filter((b) => new Date(b.checkIn) >= new Date())
    .slice(0, 5);

  return (
    <div className="p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Calendar
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage availability and view bookings
          </p>
        </div>

        <Select
          value={selectedListingId}
          onValueChange={(v) => v && setSelectedListingId(v)}
        >
          <SelectTrigger className="w-full sm:w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {partnerListings.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar */}
        <div className="rounded-2xl border bg-white p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{monthName}</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={prevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={nextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded border" />
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-primary" />
              <span className="text-muted-foreground">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-red-100 border border-red-300" />
              <span className="text-muted-foreground">Blocked</span>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-muted-foreground py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = getDateKey(day);
              const isBooked = bookedDates.has(key);
              const isBlocked = blockedDates.has(key);
              const today = new Date();
              const isToday =
                day === today.getDate() &&
                month === today.getMonth() &&
                year === today.getFullYear();
              const booking = isBooked ? getBookingForDate(day) : null;

              return (
                <button
                  key={day}
                  onClick={() => toggleBlock(day)}
                  disabled={isBooked}
                  className={cn(
                    "aspect-square rounded-lg p-1 text-xs transition-all relative flex flex-col items-center justify-center",
                    !isBooked && !isBlocked && "hover:bg-muted border border-border",
                    isBooked && "bg-primary text-white cursor-not-allowed",
                    isBlocked &&
                      "bg-red-50 border border-red-200 text-red-700",
                    isToday && "ring-2 ring-primary"
                  )}
                  title={booking ? `${booking.guestName} · ${booking.roomType}` : ""}
                >
                  <span className="font-semibold">{day}</span>
                  {isBooked && (
                    <span className="text-[9px] opacity-80 truncate max-w-full px-1">
                      {booking?.guestName.split(" ")[0]}
                    </span>
                  )}
                  {isBlocked && <Ban className="h-3 w-3 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Bulk block dates
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              Set seasonal pricing
            </Button>
          </div>
        </div>

        {/* Upcoming bookings */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="font-bold mb-4">Upcoming stays</h3>
            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <Image
                      src={b.guestAvatar}
                      alt=""
                      width={36}
                      height={36}
                      className="rounded-full object-cover h-9 w-9"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {b.guestName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(b.checkIn).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(b.checkOut).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-bold shrink-0">
                      {b.nights}n
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No upcoming bookings
              </p>
            )}
          </div>

          {/* Quick stats */}
          {selectedListing && (
            <div className="rounded-2xl border bg-white p-6">
              <h3 className="font-bold mb-4">{selectedListing.name}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total rooms</span>
                  <span className="font-bold">{selectedListing.totalRooms}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Available now</span>
                  <span className="font-bold text-emerald-600">
                    {selectedListing.availableRooms}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Blocked</span>
                  <span className="font-bold">{blockedDates.size} days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">This month</span>
                  <span className="font-bold">{bookedDates.size} booked</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
