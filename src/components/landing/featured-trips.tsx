"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/container";
import { ScrollReveal } from "@/components/shared/scroll-reveal";
import { TripCard } from "@/components/trips/trip-card";
import { trips } from "@/data/trips";

export function FeaturedTrips() {
  const featured = trips.filter((t) => t.status !== "sold-out").slice(0, 8);

  return (
    <section className="bg-white py-20 lg:py-28">
      <Container>
        <ScrollReveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
                Featured Adventures
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Hand-picked trips filling up fast
              </p>
            </div>
          </div>
        </ScrollReveal>
      </Container>

      {/* Auto-scrolling marquee */}
      <ScrollReveal>
        <div className="group relative overflow-hidden">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />

          <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-6 pb-4 group-hover:[animation-play-state:paused]">
            {/* First set */}
            {featured.map((trip) => (
              <div
                key={trip.id}
                className="w-[340px] shrink-0 sm:w-[360px]"
              >
                <TripCard trip={trip} />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {featured.map((trip) => (
              <div
                key={`dup-${trip.id}`}
                className="w-[340px] shrink-0 sm:w-[360px]"
              >
                <TripCard trip={trip} />
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <Container>
        <ScrollReveal delay={200}>
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/browse-trips" className="gap-2">
                View All Trips
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
