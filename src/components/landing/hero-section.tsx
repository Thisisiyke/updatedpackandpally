"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Star, Users } from "lucide-react";
import { Container } from "@/components/shared/container";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Small delay so the initial paint is invisible, then trigger the animation
    const timer = setTimeout(() => setInView(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5"
    >
      {/* Flying plane with trail */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 700"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="20%" stopColor="oklch(0.55 0.2 255 / 0.2)" />
              <stop offset="80%" stopColor="oklch(0.55 0.2 255 / 0.2)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <path
              id="flightPath"
              d="M-80 620 C 200 480, 350 350, 520 370 S 750 260, 920 200 S 1200 100, 1520 50"
            />
          </defs>

          {/* Dashed trail */}
          <use
            href="#flightPath"
            stroke="url(#trailGradient)"
            strokeWidth="2"
            strokeDasharray="8 6"
            fill="none"
            className="animate-[dash_40s_linear_infinite]"
          />

          {/* Plane following the path */}
          <g>
            <animateMotion
              dur="14s"
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href="#flightPath" />
            </animateMotion>
            <g transform="translate(-14, -14)">
              {/* Plane icon */}
              <path
                d="M22.5 3.5 L12 9 L2 5.5 L12 22 L14 14 L22.5 3.5Z"
                fill="oklch(0.55 0.2 255 / 0.35)"
              />
              {/* Small glow behind plane */}
              <circle cx="12" cy="12" r="10" fill="oklch(0.55 0.2 255 / 0.06)" />
            </g>
          </g>
        </svg>
      </div>

      <Container className="relative z-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-all duration-700 ease-out",
                inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Over 4,000 travelers worldwide
            </div>

            {/* Heading */}
            <h1
              className={cn(
                "mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl transition-all duration-700 ease-out delay-150",
                inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              )}
            >
              Effortlessly plan and join{" "}
              <span className="text-primary">group adventures</span>
            </h1>

            {/* Description */}
            <p
              className={cn(
                "mt-6 text-lg leading-relaxed text-muted-foreground transition-all duration-700 ease-out delay-300",
                inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              )}
            >
              Connect with fellow travelers and join curated group trips around
              the world. Browse itineraries, meet your host, and book your next
              unforgettable adventure.
            </p>

            {/* CTAs */}
            <div
              className={cn(
                "mt-8 flex flex-col gap-3 sm:flex-row sm:items-center transition-all duration-700 ease-out delay-[450ms]",
                inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              )}
            >
              <Button size="lg" className="h-12 gap-2 px-6 text-base" asChild>
                <Link href="/browse-trips">
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="h-12 gap-2 px-6 text-base text-muted-foreground"
                asChild
              >
                <Link href="/#how-it-works">View features</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div
              className={cn(
                "mt-10 flex items-center gap-6 border-t pt-6 transition-all duration-700 ease-out delay-[600ms]",
                inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              )}
            >
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {[
                    "https://randomuser.me/api/portraits/women/44.jpg",
                    "https://randomuser.me/api/portraits/men/32.jpg",
                    "https://randomuser.me/api/portraits/women/68.jpg",
                    "https://randomuser.me/api/portraits/men/75.jpg",
                  ].map((src, i) => (
                    <div
                      key={i}
                      className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-white"
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="28px"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium">4k+ travelers</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">4.9</span>
                <span className="text-sm text-muted-foreground">
                  (2k+ reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Right — Image + Floating Cards */}
          <div
            className={cn(
              "relative lg:pl-8 transition-all duration-700 ease-out delay-300",
              inView
                ? "translate-y-0 opacity-100 scale-100"
                : "translate-y-10 opacity-0 scale-95"
            )}
          >
            {/* Main image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80"
                alt="Travel adventure on an open road"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Floating card — Trip Preview (top right) */}
            <div
              className={cn(
                "absolute -top-4 -right-2 z-10 hidden rounded-xl border bg-white/95 backdrop-blur-sm p-3 shadow-lg sm:block lg:-right-6 animate-[float_3s_ease-in-out_infinite] transition-all duration-700 ease-out delay-700",
                inView
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-4 opacity-0"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1.5">
                  {[
                    { city: "Barcelona", price: "$714", color: "bg-red-400" },
                    { city: "Paris", price: "$520", color: "bg-amber-400" },
                    {
                      city: "Santorini",
                      price: "$680",
                      color: "bg-emerald-400",
                    },
                  ].map((item) => (
                    <div
                      key={item.city}
                      className="flex items-center justify-between gap-6 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${item.color}`}
                        />
                        <span className="font-medium text-foreground">
                          {item.city}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating card — Destination (bottom left) */}
            <div
              className={cn(
                "absolute -bottom-6 -left-4 z-10 hidden rounded-xl border bg-white/95 backdrop-blur-sm p-4 shadow-lg sm:block lg:-left-8 animate-[float_3s_ease-in-out_infinite_1.5s] transition-all duration-700 ease-out delay-[900ms]",
                inView
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&q=80"
                    alt="Paris"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold">Paris</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    12 travelers
                  </div>
                </div>
              </div>
              <Button size="sm" className="mt-3 h-7 w-full gap-1 text-xs">
                <MapPin className="h-3 w-3" />
                Book trip
              </Button>
            </div>

            {/* Decorative blob behind the image */}
            <div className="absolute -z-10 -top-10 -right-10 h-[120%] w-[120%] rounded-full bg-primary/5 blur-3xl" />
          </div>
        </div>
      </Container>
    </section>
  );
}
