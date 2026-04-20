"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, Compass, Plane, Hotel as HotelIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomTabs } from "@/components/mobile/bottom-tabs";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { useWishlist, WishlistType } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  WishlistType,
  { label: string; icon: any; color: string; detailPath: string }
> = {
  trip: {
    label: "Trips",
    icon: Compass,
    color: "text-violet-600 bg-violet-50",
    detailPath: "/mobile/trips",
  },
  flight: {
    label: "Flights",
    icon: Plane,
    color: "text-blue-600 bg-blue-50",
    detailPath: "/mobile/flights",
  },
  hotel: {
    label: "Hotels",
    icon: HotelIcon,
    color: "text-emerald-600 bg-emerald-50",
    detailPath: "/mobile/hotels",
  },
};

export default function MobileSavedPage() {
  const { items, hydrated, remove, count } = useWishlist();
  const [tab, setTab] = useState<"all" | WishlistType>("all");

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((i) => i.type === tab);
  }, [items, tab]);

  const counts = {
    all: items.length,
    trip: items.filter((i) => i.type === "trip").length,
    flight: items.filter((i) => i.type === "flight").length,
    hotel: items.filter((i) => i.type === "hotel").length,
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Saved" showBack={false} />

      {/* Tabs */}
      <div className="bg-white px-4 pb-3 border-b">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {[
            { value: "all", label: "All" },
            { value: "trip", label: "Trips" },
            { value: "hotel", label: "Hotels" },
            { value: "flight", label: "Flights" },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value as any)}
              className={cn(
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                tab === t.value
                  ? "border-primary bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {t.label} ({counts[t.value as keyof typeof counts]})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!hydrated ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Heart className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-bold text-base mb-1">No saved items yet</h3>
            <p className="text-xs text-muted-foreground mb-6 max-w-[240px] mx-auto">
              Tap the heart on any trip, flight, or hotel to save it here for later.
            </p>
            <Button asChild>
              <Link href="/mobile/explore">Start exploring</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const config = typeConfig[item.type];
              const Icon = config.icon;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="relative rounded-2xl bg-white border overflow-hidden"
                >
                  <Link
                    href={
                      item.type === "trip"
                        ? `${config.detailPath}/${item.id}`
                        : item.type === "hotel"
                        ? "/mobile/search/hotels"
                        : "/mobile/search/flights"
                    }
                    className="flex gap-3 p-3"
                  >
                    {item.image ? (
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "flex h-20 w-24 shrink-0 items-center justify-center rounded-xl",
                          config.color
                        )}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 pr-10">
                      <div className="flex items-center gap-1 mb-1">
                        <div
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded",
                            config.color
                          )}
                        >
                          <Icon className="h-2.5 w-2.5" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.type}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm leading-tight line-clamp-2">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                      {item.price ? (
                        <p className="mt-1.5 text-sm font-bold">
                          ${item.price.toLocaleString()}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            {item.type === "hotel" ? "/night" : ""}
                          </span>
                        </p>
                      ) : null}
                    </div>
                  </Link>
                  <button
                    onClick={() => remove(item.id, item.type)}
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-muted/70 hover:bg-red-50 hover:text-red-600 transition-colors"
                    aria-label="Remove from saved"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomTabs />
    </div>
  );
}
