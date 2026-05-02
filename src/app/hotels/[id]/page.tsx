"use client";

import { Suspense, use, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Star,
  MapPin,
  Check,
  Clock,
  Shield,
  Users,
  Bed,
  Wifi,
  Coffee,
  Dumbbell,
  Car,
  Heart,
} from "lucide-react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { generateHotels, formatHotelPrice, calculateNights } from "@/lib/hotel-generator";
import { cn } from "@/lib/utils";
import { useRequireMember } from "@/hooks/use-require-member";

function HotelDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ensureMember, loginDialog } = useRequireMember();
  const location = searchParams.get("location") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = Number(searchParams.get("guests") || "2");
  const rooms = Number(searchParams.get("rooms") || "1");

  const hotels = useMemo(() => {
    if (!location || !checkIn || !checkOut) return [];
    return generateHotels({ location, checkIn, checkOut, guests, rooms });
  }, [location, checkIn, checkOut, guests, rooms]);

  const hotel = hotels.find((h) => h.id === id);
  const nights = calculateNights(checkIn, checkOut);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  if (!hotel) {
    return (
      <Container className="py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Hotel not found</h1>
          <p className="text-muted-foreground mt-2">
            Please search again to find available hotels.
          </p>
          <Button asChild className="mt-6">
            <Link href="/hotels">Back to search</Link>
          </Button>
        </div>
      </Container>
    );
  }

  const selectedRoom = hotel.roomTypes.find((r) => r.id === selectedRoomId) || hotel.roomTypes[0];
  const total = selectedRoom.pricePerNight * nights;

  const handleContinue = () => {
    ensureMember(() => {
      const params = new URLSearchParams(searchParams);
      params.set("type", "hotel");
      params.set("hotelId", hotel.id);
      params.set("roomId", selectedRoom.id);
      router.push(`/checkout?${params.toString()}`);
    });
  };

  const amenityIconMap: Record<string, any> = {
    "Free WiFi": Wifi,
    "Breakfast Included": Coffee,
    "Fitness Center": Dumbbell,
    "Parking": Car,
  };

  return (
    <section className="pb-16">
      {loginDialog}
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <Container className="py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/hotels" className="hover:text-foreground">
              Hotels
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link
              href={`/hotels?${searchParams.toString()}`}
              className="hover:text-foreground"
            >
              {hotel.city}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {hotel.name}
            </span>
          </nav>
        </Container>
      </div>

      <Container className="mt-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{hotel.name}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {hotel.address}
            </span>
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {hotel.rating} ({hotel.reviewCount} reviews)
            </span>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:grid-rows-2 md:h-[420px]">
          <div className="relative col-span-1 md:col-span-2 md:row-span-2 overflow-hidden rounded-xl">
            <Image
              src={hotel.images[selectedImageIdx]}
              alt={hotel.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          {hotel.images.slice(1, 5).map((img, i) => (
            <div
              key={i}
              className="relative hidden md:block overflow-hidden rounded-xl cursor-pointer"
              onClick={() => setSelectedImageIdx(i + 1)}
            >
              <Image
                src={img}
                alt={`${hotel.name} ${i + 2}`}
                fill
                className="object-cover hover:opacity-90 transition-opacity"
                sizes="25vw"
              />
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          {/* Left — Content */}
          <div className="space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-xl font-bold mb-3">About this stay</h2>
              <p className="text-muted-foreground leading-relaxed">
                {hotel.description}
              </p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-bold mb-4">What this place offers</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {hotel.amenities.map((a) => {
                  const Icon = amenityIconMap[a] || Check;
                  return (
                    <div key={a} className="flex items-center gap-2 text-sm">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {a}
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Rooms */}
            <div>
              <h2 className="text-xl font-bold mb-4">Choose your room</h2>
              <div className="space-y-4">
                {hotel.roomTypes.map((room) => (
                  <div
                    key={room.id}
                    className={cn(
                      "flex flex-col gap-4 rounded-xl border p-4 transition-all cursor-pointer sm:flex-row",
                      selectedRoom.id === room.id
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "hover:shadow-md"
                    )}
                    onClick={() => setSelectedRoomId(room.id)}
                  >
                    <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-lg sm:h-auto sm:w-48">
                      <Image
                        src={room.image}
                        alt={room.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 192px"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{room.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {room.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Max {room.maxGuests} guests
                        </span>
                        <span className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          {room.bedConfig}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {room.refundable && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                            Refundable
                          </Badge>
                        )}
                        {room.breakfastIncluded && (
                          <Badge variant="secondary" className="text-xs">
                            Breakfast included
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {nights} {nights === 1 ? "night" : "nights"}
                      </p>
                      <p className="text-xl font-bold">
                        {formatHotelPrice(room.pricePerNight * nights)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatHotelPrice(room.pricePerNight)}/night
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Policies */}
            <div>
              <h2 className="text-xl font-bold mb-4">House rules</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Check-in</p>
                    <p className="text-xs text-muted-foreground">
                      After {hotel.policies.checkIn}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Check-out</p>
                    <p className="text-xs text-muted-foreground">
                      Before {hotel.policies.checkOut}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:col-span-2">
                  <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Cancellation policy</p>
                    <p className="text-xs text-muted-foreground">
                      {hotel.policies.cancellation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Booking card */}
          <div>
            <div className="sticky top-24 rounded-2xl border bg-white p-6 shadow-lg">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold">
                  {formatHotelPrice(selectedRoom.pricePerNight)}
                </span>
                <span className="text-sm text-muted-foreground">/ night</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedRoom.name}
              </p>

              <div className="space-y-3 rounded-lg border p-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Check-in</p>
                  <p className="text-sm font-medium">
                    {new Date(checkIn).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Check-out</p>
                  <p className="text-sm font-medium">
                    {new Date(checkOut).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Guests</p>
                  <p className="text-sm font-medium">
                    {guests} {guests === 1 ? "guest" : "guests"} · {rooms}{" "}
                    {rooms === 1 ? "room" : "rooms"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {formatHotelPrice(selectedRoom.pricePerNight)} × {nights} nights
                  </span>
                  <span>{formatHotelPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Taxes & fees</span>
                  <span>{formatHotelPrice(Math.round(total * 0.12))}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  {formatHotelPrice(Math.round(total * 1.12))}
                </span>
              </div>

              <Button
                className="mt-6 w-full h-12 text-base"
                size="lg"
                onClick={handleContinue}
              >
                Reserve
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                You won&apos;t be charged yet
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading...</div>}>
      <HotelDetailContent id={id} />
    </Suspense>
  );
}
