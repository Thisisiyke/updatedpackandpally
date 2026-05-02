"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { FeaturedHotelCard } from "@/components/hotels/featured-hotel-card";
import {
  generateHotels,
  getMarketingHotelStayDates,
} from "@/lib/hotel-generator";

// A curated mix of destinations for the featured row
const FEATURED_LOCATIONS = [
  "Paris, France",
  "Bali, Indonesia",
  "Tokyo, Japan",
  "Santorini, Greece",
  "Dubai, UAE",
  "New York, USA",
  "Barcelona, Spain",
  "Marrakech, Morocco",
];

export function FeaturedHotels() {
  const featured = useMemo(() => {
    const { checkIn, checkOut } = getMarketingHotelStayDates();

    // Pick one top-rated hotel from each location for variety
    return FEATURED_LOCATIONS.map((location) => {
      const list = generateHotels({
        location,
        checkIn,
        checkOut,
        guests: 2,
        rooms: 1,
      });
      // Grab the best one by star rating
      return list.sort((a, b) => b.starRating - a.starRating)[0];
    }).filter(Boolean);
  }, []);

  return (
    <section className="py-20 lg:py-28">
      <Container>
        <ScrollReveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                Featured Hotels
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Hand-picked stays in the world&apos;s most unforgettable cities
              </p>
            </div>
          </div>
        </ScrollReveal>
      </Container>

      {/* Auto-scrolling marquee — reverses direction from trips for variety */}
      <ScrollReveal>
        <div className="group relative overflow-hidden">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />

          <div className="flex w-max animate-[marquee-reverse_45s_linear_infinite] gap-6 pb-4 pl-6 group-hover:[animation-play-state:paused]">
            {/* First set */}
            {featured.map((hotel) => (
              <div
                key={hotel.id}
                className="w-[320px] shrink-0 sm:w-[340px]"
              >
                <FeaturedHotelCard hotel={hotel} />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {featured.map((hotel) => (
              <div
                key={`dup-${hotel.id}`}
                className="w-[320px] shrink-0 sm:w-[340px]"
              >
                <FeaturedHotelCard hotel={hotel} />
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <Container>
        <ScrollReveal delay={200}>
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/hotels" className="gap-2">
                View All Hotels
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
