"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MapPin, Heart, Plane, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/mobile/home", label: "Home", icon: Home },
  { href: "/mobile/explore", label: "Explore", icon: Compass },
  { href: "/mobile/map", label: "Map", icon: MapPin },
  { href: "/mobile/saved", label: "Saved", icon: Heart },
  { href: "/mobile/bookings", label: "Trips", icon: Plane },
  { href: "/mobile/profile", label: "Profile", icon: User },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 bg-white border-t md:pb-6">
      <div className="grid grid-cols-6">
        {tabs.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon
                className={cn("h-5 w-5", active && "fill-primary/10")}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={cn("text-[10px] font-medium", active && "font-bold")}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
