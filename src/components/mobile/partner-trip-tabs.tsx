"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PartnerTripTabs({ tripId }: { tripId: string }) {
  const pathname = usePathname() || "";
  const base = `/mobile/partner/trips/${tripId}`;

  const tabs = [
    { href: base, label: "Overview", exact: true },
    { href: `${base}/travelers`, label: "Travelers", exact: false },
    { href: `${base}/surveys`, label: "Surveys", exact: false },
  ];

  return (
    <div className="sticky top-0 z-20 bg-white border-b">
      <div className="flex">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "relative flex-1 py-3 text-center text-xs font-semibold transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t.label}
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-12 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
