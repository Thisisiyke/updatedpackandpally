"use client";

import Image from "next/image";
import { Smartphone, Star, ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/container";
import { cn } from "@/lib/utils";

export function DownloadApp() {
  return (
    <section
      id="get-the-app"
      className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-violet-600 py-20 lg:py-28"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl" />

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Copy + buttons */}
          <div className="text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
              <Smartphone className="h-3 w-3" />
              Get the app
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              Take Pack &amp; Pally <br />
              wherever you go.
            </h2>
            <p className="mt-4 text-lg text-white/85 leading-relaxed max-w-md">
              Browse trips, message your group, drop activity pins on the map,
              and pay your balance — all from your phone. iOS and Android.
            </p>

            {/* Store buttons */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <StoreButton
                store="ios"
                href="#"
                topLine="Download on the"
                bottomLine="App Store"
              />
              <StoreButton
                store="android"
                href="#"
                topLine="Get it on"
                bottomLine="Google Play"
              />
            </div>

            {/* Social proof */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "https://randomuser.me/api/portraits/women/22.jpg",
                  "https://randomuser.me/api/portraits/men/45.jpg",
                  "https://randomuser.me/api/portraits/women/68.jpg",
                ].map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt=""
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full border-2 border-primary object-cover"
                  />
                ))}
              </div>
              <div className="text-xs text-white/85 leading-tight">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="h-3 w-3 fill-amber-300 text-amber-300"
                    />
                  ))}
                  <span className="ml-1 font-bold">4.9</span>
                </div>
                <span className="text-white/70">
                  4,000+ travelers · 200+ trips
                </span>
              </div>
            </div>
          </div>

          {/* Phone preview */}
          <div className="relative mx-auto hidden lg:block">
            <PhoneMock />
          </div>
        </div>
      </Container>
    </section>
  );
}

function StoreButton({
  store,
  href,
  topLine,
  bottomLine,
}: {
  store: "ios" | "android";
  href: string;
  topLine: string;
  bottomLine: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl bg-black px-5 py-3 text-white shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white",
        "min-w-[180px]"
      )}
    >
      {store === "ios" ? <AppleLogo /> : <PlayStoreLogo />}
      <span className="flex flex-col text-left leading-tight">
        <span className="text-[10px] font-medium opacity-80 tracking-wide">
          {topLine}
        </span>
        <span className="text-base font-bold tracking-tight">
          {bottomLine}
        </span>
      </span>
      <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-80" />
    </a>
  );
}

function AppleLogo() {
  // Apple wordmark glyph used on official "Download on the App Store" badges.
  return (
    <svg
      viewBox="0 0 384 512"
      className="h-7 w-7 fill-current"
      aria-hidden="true"
    >
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM275.5 90.7c20.8-24.7 18.9-47.2 18.3-55.3-18.4 1.1-39.7 12.5-51.8 26.6-13.3 15.1-21.1 33.8-19.4 54.9 19.9 1.5 38.1-8.7 52.9-26.2z" />
    </svg>
  );
}

function PlayStoreLogo() {
  return (
    <svg
      viewBox="0 0 512 512"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pp-pg-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00C3FF" />
          <stop offset="100%" stopColor="#0080F0" />
        </linearGradient>
        <linearGradient id="pp-pg-yellow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE000" />
          <stop offset="100%" stopColor="#FFB900" />
        </linearGradient>
        <linearGradient id="pp-pg-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF4D4D" />
          <stop offset="100%" stopColor="#E60017" />
        </linearGradient>
        <linearGradient id="pp-pg-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00F076" />
          <stop offset="100%" stopColor="#00B85A" />
        </linearGradient>
      </defs>
      <path
        fill="url(#pp-pg-blue)"
        d="M81.5 32.6C72.5 38 67 47.7 67 60v392c0 12.3 5.5 22 14.5 27.4l232-223.4z"
      />
      <path
        fill="url(#pp-pg-yellow)"
        d="M361.7 197.6L313.5 256l48.2 58.4 81-46.7c14.6-8.3 14.6-29.1 0-37.4z"
      />
      <path
        fill="url(#pp-pg-red)"
        d="M81.5 479.4c8 4.8 18 5 27.5 0l253-145.6L313.5 256z"
      />
      <path
        fill="url(#pp-pg-green)"
        d="M81.5 32.6L313.5 256l48.2-58.4-253-145.6c-9.5-5-19.5-4.8-27.2 1z"
      />
    </svg>
  );
}

function PhoneMock() {
  return (
    <div className="relative h-[520px] w-[260px]">
      {/* Phone body */}
      <div className="absolute inset-0 rounded-[44px] bg-neutral-900 shadow-2xl ring-4 ring-black/20" />
      {/* Screen */}
      <div className="absolute inset-[6px] overflow-hidden rounded-[40px] bg-white">
        <div className="relative h-full w-full">
          <Image
            src="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80"
            alt="Pack & Pally app preview"
            fill
            className="object-cover"
            sizes="260px"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase opacity-80">
              Coastal Wonders
            </p>
            <p className="mt-1 text-lg font-bold leading-tight">
              Of Amalfi
            </p>
            <p className="mt-0.5 text-xs opacity-80">7 days · Sofia M.</p>
            <button className="mt-3 w-full rounded-full bg-white py-2 text-xs font-bold text-primary">
              Join this trip
            </button>
          </div>
        </div>
      </div>
      {/* Notch */}
      <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900" />
    </div>
  );
}
