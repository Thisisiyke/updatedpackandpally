"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Heart } from "lucide-react";
import type { Hotel } from "@/types/booking";
import { Badge } from "@/components/ui/badge";
import { formatHotelPrice, getMarketingHotelStayDates } from "@/lib/hotel-generator";

export function FeaturedHotelCard({ hotel }: { hotel: Hotel }) {
  const { checkIn, checkOut } = getMarketingHotelStayDates();
  return (
    <Link
      href={`/hotels/${hotel.id}?location=${encodeURIComponent(
        `${hotel.city}, ${hotel.country}`
      )}&checkIn=${checkIn}&checkOut=${checkOut}&guests=2&rooms=1`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-lg hover:-translate-y-0.5 duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={hotel.coverImage}
          alt={hotel.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 360px"
        />
        <button
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
          onClick={(e) => e.preventDefault()}
          aria-label="Save hotel"
        >
          <Heart className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-0.5 rounded-full bg-white/90 backdrop-blur-sm px-2 py-1">
          {Array.from({ length: hotel.starRating }).map((_, i) => (
            <Star
              key={i}
              className="h-2.5 w-2.5 fill-amber-400 text-amber-400"
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-base leading-tight line-clamp-1 flex-1">
            {hotel.name}
          </h3>
          <div className="flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 shrink-0">
            <span className="text-xs font-bold text-primary">
              {hotel.rating}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {hotel.city}, {hotel.country}
        </p>

        <div className="mt-3 flex flex-wrap gap-1">
          {hotel.amenities.slice(0, 2).map((a) => (
            <Badge
              key={a}
              variant="secondary"
              className="text-[10px] font-normal py-0 px-1.5"
            >
              {a}
            </Badge>
          ))}
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between border-t mt-3">
          <span className="text-[10px] text-muted-foreground">
            {hotel.reviewCount.toLocaleString("en-US")} reviews
          </span>
          <div className="text-right">
            <p className="text-lg font-bold leading-none">
              {formatHotelPrice(hotel.pricePerNight)}
            </p>
            <p className="text-[10px] text-muted-foreground">per night</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
