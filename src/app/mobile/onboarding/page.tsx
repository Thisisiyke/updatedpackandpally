"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    title: "Find your dream\ngetaway",
    description:
      "Discover amazing vacation packages and create memories that last a lifetime.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=95&auto=format&fit=crop",
  },
  {
    title: "Book flights & hotels\nin seconds",
    description:
      "Compare thousands of flights and stays worldwide. Best prices, zero hassle.",
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=2000&q=95&auto=format&fit=crop",
  },
  {
    title: "Travel smarter\nwith AI",
    description:
      "AI trip generator, smart packing lists, and a travel chatbot — always in your pocket.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=95&auto=format&fit=crop",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Auto-advance every 5 seconds, looping infinitely
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [step]);

  return (
    <div className="relative h-full min-h-[844px] flex flex-col bg-[#0a0f1a] text-white overflow-hidden">
      {/* Sliding stack of images */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${step * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="relative w-full h-full shrink-0"
            >
              <Image
                src={slide.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                quality={100}
                priority={i === 0}
                unoptimized
              />
              {/* Top gradient — dark enough to read heading & logo, fades cleanly into photo */}
              <div className="absolute top-0 left-0 right-0 h-[55%] bg-gradient-to-b from-[#0a0f1a] via-[#0a0f1a]/80 to-transparent" />
              {/* Bottom vignette for button area contrast */}
              <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/50 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Top brand header */}
      <div className="relative z-10 flex items-center gap-2 px-5 pt-5 md:pt-14">
        <div className="relative h-7 w-7">
          <Image
            src="/logo.png"
            alt="Pack & Pally"
            fill
            className="object-contain"
            sizes="28px"
            priority
          />
        </div>
        <span className="text-xs font-bold tracking-[0.15em] uppercase">
          Pack & Pally
        </span>
      </div>

      {/* Heading + description (slides with image via key to trigger re-render) */}
      <div className="relative z-10 px-6 pt-8">
        <div key={step} className="animate-[fade-in-up_500ms_ease-out]">
          <h1 className="text-[32px] font-semibold leading-[1.15] tracking-tight whitespace-pre-line">
            {slides[step].title}
          </h1>
          <p className="mt-3 text-sm text-white/75 leading-relaxed max-w-[85%]">
            {slides[step].description}
          </p>
        </div>
      </div>

      {/* Bottom UI */}
      <div className="relative z-10 mt-auto">
        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 pb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-6 bg-white" : "w-1.5 bg-white/30"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* CTAs */}
        <div className="px-5 pb-4 space-y-2.5">
          <Button
            size="lg"
            className="w-full h-14 rounded-2xl bg-white text-black hover:bg-white/95 text-base font-bold"
            onClick={() => router.push("/mobile/auth?mode=signup")}
          >
            Sign Up
          </Button>
          <Button
            size="lg"
            className="w-full h-14 rounded-2xl text-white text-base font-bold hover:brightness-110 transition-all"
            style={{ backgroundColor: "#026de2" }}
            onClick={() => router.push("/mobile/auth?mode=login")}
          >
            Sign In
          </Button>
        </div>

        {/* Terms footer */}
        <div className="px-6 pb-8 md:pb-10 text-center">
          <p className="text-[11px] text-white/40 leading-relaxed">
            By continuing, you agree to our{" "}
            <span className="text-white/70 underline underline-offset-2 font-medium">
              Terms of Service
            </span>
            {" "}and{" "}
            <span className="text-white/70 underline underline-offset-2 font-medium">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
