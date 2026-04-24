"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Heart } from "lucide-react";
import { Hotel } from "@/types/booking";
import { Badge } from "@/components/ui/badge";
import { formatHotelPrice, calculateNights } from "@/lib/hotel-generator";

export function HotelCard({
  hotel,
  checkIn,
  checkOut,
  searchParams,
}: {
  hotel: Hotel;
  checkIn: string;
  checkOut: string;
  searchParams: URLSearchParams;
}) {
  const nights = calculateNights(checkIn, checkOut);
  const total = hotel.pricePerNight * nights;
  const params = new URLSearchParams(searchParams);
  const href = `/hotels/${hotel.id}?${params.toString()}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-lg hover:-translate-y-0.5 duration-300 sm:flex-row"
    >
      {/* Image */}
      <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-72">
        <Image
          src={hotel.coverImage}
          alt={hotel.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 288px"
        />
        <button
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <Heart className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <h3 className="font-bold text-lg leading-tight">{hotel.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {hotel.neighborhood} · {hotel.distanceFromCenter}km from center
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 shrink-0">
              <span className="text-sm font-bold text-primary">
                {hotel.rating}
              </span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 4).map((a) => (
              <Badge key={a} variant="secondary" className="text-xs font-normal">
                {a}
              </Badge>
            ))}
            {hotel.amenities.length > 4 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{hotel.amenities.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-end justify-between gap-2 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            {hotel.reviewCount.toLocaleString()} reviews
          </p>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {nights} {nights === 1 ? "night" : "nights"} total
            </p>
            <p className="text-2xl font-bold">{formatHotelPrice(total)}</p>
            <p className="text-xs text-muted-foreground">
              {formatHotelPrice(hotel.pricePerNight)}/night
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
