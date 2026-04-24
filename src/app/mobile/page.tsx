"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MobileSplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/mobile/onboarding");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="relative h-full min-h-[844px] flex items-center justify-center bg-white overflow-hidden">
      {/* Soft purple blur blob — top left */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-indigo-400/50 blur-3xl" />

      {/* Soft pink blur blob — bottom right */}
      <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-pink-300/40 blur-3xl" />

      {/* Subtle lavender accent — middle left */}
      <div className="absolute top-1/3 -left-10 h-40 w-40 rounded-full bg-violet-300/30 blur-3xl" />

      {/* Logo centered */}
      <div className="relative z-10 animate-[fade-in-up_700ms_ease-out]">
        <div className="relative h-28 w-28">
          <Image
            src="/logo.png"
            alt="Pack & Pally"
            fill
            className="object-contain"
            sizes="112px"
            priority
          />
        </div>
      </div>
    </div>
  );
}
