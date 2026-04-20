"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Trip } from "@/types";
import { hosts } from "@/data/hosts";

function getStatusBadge(status: Trip["status"]) {
  switch (status) {
    case "filling":
      return { label: "Filling Up", variant: "secondary" as const, className: "bg-amber-100 text-amber-800 border-amber-200" };
    case "almost-full":
      return { label: "Almost Full", variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200" };
    case "upcoming":
      return { label: "New", variant: "secondary" as const, className: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    case "sold-out":
      return { label: "Sold Out", variant: "secondary" as const, className: "bg-gray-100 text-gray-600 border-gray-200" };
  }
}

export function TripCard({ trip }: { trip: Trip }) {
  const host = hosts.find((h) => h.id === trip.hostId);
  const badge = getStatusBadge(trip.status);
  const startDate = new Date(trip.startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endDate = new Date(trip.endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group block overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={trip.coverImage}
          alt={trip.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <Badge variant={badge.variant} className={badge.className}>
            {badge.label}
          </Badge>
        </div>
        <button
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {trip.destination}, {trip.country}
        </p>
        <h3 className="mt-1 text-lg font-bold leading-snug line-clamp-1">
          {trip.title}
        </h3>

        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {startDate} - {endDate}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {trip.currentBookings}/{trip.maxGroupSize}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1 text-sm">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-medium">{trip.rating}</span>
          <span className="text-muted-foreground">
            ({trip.reviewCount} reviews)
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div>
            <span className="text-xs text-muted-foreground">From</span>
            <p className="text-lg font-bold">
              ${trip.price.toLocaleString()}
            </p>
          </div>
          {host && (
            <div className="flex items-center gap-2">
              <div className="relative h-7 w-7 overflow-hidden rounded-full">
                <Image
                  src={host.avatar}
                  alt={host.name}
                  fill
                  className="object-cover"
                  sizes="28px"
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {host.name.split(" ")[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
