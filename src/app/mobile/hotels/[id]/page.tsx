"use client";

import { use, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Star,
  MapPin,
  Heart,
  Share2,
  Check,
  Clock,
  Shield,
  Bed,
  Users,
  Wifi,
  Coffee,
  Dumbbell,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { useWishlist } from "@/hooks/use-wishlist";
import { generateHotels, formatHotelPrice, calculateNights } from "@/lib/hotel-generator";
import { cn } from "@/lib/utils";

const amenityIconMap: Record<string, any> = {
  "Free WiFi": Wifi,
  "Breakfast Included": Coffee,
  "Fitness Center": Dumbbell,
  Parking: Car,
};

export default function MobileHotelDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const wishlist = useWishlist();
  const location = searchParams.get("location") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = Number(searchParams.get("guests") || "2");
  const rooms = Number(searchParams.get("rooms") || "1");

  const [imageIdx, setImageIdx] = useState(0);
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const hotels = useMemo(() => {
    if (!location || !checkIn || !checkOut) return [];
    return generateHotels({ location, checkIn, checkOut, guests, rooms });
  }, [location, checkIn, checkOut, guests, rooms]);

  const hotel = hotels.find((h) => h.id === id);
  const nights = calculateNights(checkIn, checkOut);

  if (!hotel) {
    return (
      <div className="flex flex-col h-full min-h-[844px]">
        <MobileHeader title="Hotel" />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <p className="font-semibold">Hotel not found</p>
            <Button onClick={() => router.back()} className="mt-4">Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedRoom = hotel.roomTypes.find((r) => r.id === selectedRoomId) || hotel.roomTypes[0];
  const total = selectedRoom.pricePerNight * nights;
  const totalWithTax = Math.round(total * 1.12);

  const handleBook = () => {
    const params = new URLSearchParams(searchParams);
    params.set("type", "hotel");
    params.set("hotelId", hotel.id);
    params.set("roomId", selectedRoom.id);
    router.push(`/mobile/checkout?${params.toString()}`);
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      {/* Image carousel (pulls up behind the header) */}
      <div className="relative">
        <div className="relative h-72 w-full overflow-hidden">
          <Image
            src={hotel.images[imageIdx]}
            alt={hotel.name}
            fill
            className="object-cover"
            sizes="400px"
            priority
          />
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {hotel.images.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => setImageIdx(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === imageIdx ? "w-6 bg-white" : "w-1.5 bg-white/60"
                )}
              />
            ))}
          </div>
        </div>

        {/* Floating header */}
        <MobileHeader
          transparent
          className="absolute top-0 left-0 right-0"
          action={
            <div className="flex gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md">
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  hotel &&
                  wishlist.toggle({
                    id: hotel.id,
                    type: "hotel",
                    title: hotel.name,
                    subtitle: `${hotel.city}, ${hotel.country}`,
                    image: hotel.coverImage,
                    price: hotel.pricePerNight,
                  })
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md"
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    hotel && wishlist.isSaved(hotel.id, "hotel")
                      ? "fill-red-500 text-red-500"
                      : ""
                  )}
                />
              </button>
            </div>
          }
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-white rounded-t-3xl -mt-5 relative z-10">
        <div className="p-5">
          {/* Stars */}
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <h1 className="text-xl font-bold leading-tight">{hotel.name}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" />
            {hotel.address}
          </p>

          {/* Rating */}
          <div className="mt-3 rounded-xl bg-primary/5 border border-primary/10 p-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold">
              {hotel.rating}
            </div>
            <div>
              <p className="text-sm font-semibold">Excellent</p>
              <p className="text-[10px] text-muted-foreground">
                Based on {hotel.reviewCount.toLocaleString()} reviews
              </p>
            </div>
          </div>

          <Separator className="my-5" />

          {/* About */}
          <h2 className="text-sm font-bold mb-2">About this stay</h2>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
            {hotel.description}
          </p>

          <Separator className="my-5" />

          {/* Amenities */}
          <h2 className="text-sm font-bold mb-3">What's included</h2>
          <div className="grid grid-cols-2 gap-2">
            {hotel.amenities.slice(0, 8).map((a) => {
              const Icon = amenityIconMap[a] || Check;
              return (
                <div key={a} className="flex items-center gap-2 text-xs">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{a}</span>
                </div>
              );
            })}
          </div>

          <Separator className="my-5" />

          {/* Rooms */}
          <h2 className="text-sm font-bold mb-3">Choose your room</h2>
          <div className="space-y-2">
            {hotel.roomTypes.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={cn(
                  "w-full flex gap-3 rounded-xl border p-3 text-left transition-all",
                  selectedRoom.id === room.id
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : "hover:bg-muted/30"
                )}
              >
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm line-clamp-1">{room.name}</p>
                  <div className="flex flex-wrap gap-2 mt-0.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Users className="h-2.5 w-2.5" />
                      {room.maxGuests}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Bed className="h-2.5 w-2.5" />
                      {room.bedConfig}
                    </span>
                  </div>
                  {(room.refundable || room.breakfastIncluded) && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {room.refundable && (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[9px] py-0">
                          Refundable
                        </Badge>
                      )}
                      {room.breakfastIncluded && (
                        <Badge variant="secondary" className="text-[9px] py-0">
                          Breakfast
                        </Badge>
                      )}
                    </div>
                  )}
                  <p className="mt-1.5 text-sm font-bold">
                    {formatHotelPrice(room.pricePerNight)}
                    <span className="text-[10px] font-normal text-muted-foreground">/night</span>
                  </p>
                </div>
              </button>
            ))}
          </div>

          <Separator className="my-5" />

          {/* Policies */}
          <h2 className="text-sm font-bold mb-3">House rules</h2>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium">
                  Check-in after {hotel.policies.checkIn}
                </p>
                <p className="text-muted-foreground">
                  Check-out before {hotel.policies.checkOut}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {hotel.policies.cancellation}
              </p>
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="sticky bottom-0 bg-white border-t p-4 md:pb-8 flex items-center gap-3">
        <div>
          <p className="text-[10px] text-muted-foreground">
            {nights} night{nights !== 1 ? "s" : ""}
          </p>
          <p className="text-xl font-bold">{formatHotelPrice(totalWithTax)}</p>
        </div>
        <Button onClick={handleBook} className="flex-1 h-12" size="lg">
          Reserve
        </Button>
      </div>
    </div>
  );
}
