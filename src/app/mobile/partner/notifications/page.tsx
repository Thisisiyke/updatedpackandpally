"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Users,
  Compass,
  CheckCheck,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { PartnerBottomTabs } from "@/components/mobile/partner-bottom-tabs";
import {
  getAllHostBookings,
  markBookingsViewed,
  subscribeToPartnerNotifications,
  type PartnerBookingNotification,
} from "@/lib/partner-notifications";
import { subscribeToUserPartnerTrips } from "@/lib/user-partner-trips";
import { cn } from "@/lib/utils";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function relTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d === 1) return "yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function MobilePartnerNotificationsPage() {
  const [items, setItems] = useState<PartnerBookingNotification[]>([]);

  const refresh = () => setItems(getAllHostBookings());

  useEffect(() => {
    refresh();
    // After viewing the inbox, mark everything read on unmount so the badge clears
    const unsubA = subscribeToPartnerNotifications(refresh);
    const unsubB = subscribeToUserPartnerTrips(refresh);
    return () => {
      unsubA();
      unsubB();
      markBookingsViewed();
    };
  }, []);

  const unreadCount = useMemo(
    () => items.filter((i) => i.unread).length,
    [items]
  );

  const grouped = useMemo(() => {
    const today: PartnerBookingNotification[] = [];
    const earlier: PartnerBookingNotification[] = [];
    const todayCutoff = Date.now() - 24 * 60 * 60_000;
    items.forEach((it) => {
      const ts = new Date(it.booking.createdAt).getTime();
      if (ts >= todayCutoff) today.push(it);
      else earlier.push(it);
    });
    return { today, earlier };
  }, [items]);

  return (
    <div className="relative flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title="Booking notifications"
        action={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => {
                markBookingsViewed();
                refresh();
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-primary"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          ) : null
        }
      />

      <div className="flex-1 overflow-y-auto pb-2">
        {items.length === 0 ? (
          <div className="flex h-full min-h-[60vh] items-center justify-center p-6 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-4 font-semibold">No bookings yet</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
                When travelers book your trips, you&apos;ll see them here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {grouped.today.length > 0 && (
              <Section title="Today">
                {grouped.today.map((n) => (
                  <NotificationRow key={n.bookingId} item={n} />
                ))}
              </Section>
            )}
            {grouped.earlier.length > 0 && (
              <Section title="Earlier">
                {grouped.earlier.map((n) => (
                  <NotificationRow key={n.bookingId} item={n} />
                ))}
              </Section>
            )}
          </>
        )}
      </div>

      <PartnerBottomTabs />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-5 mb-1">
        {title}
      </p>
      <div className="bg-white border-y divide-y">{children}</div>
    </div>
  );
}

function NotificationRow({ item }: { item: PartnerBookingNotification }) {
  const { trip, booking, unread } = item;
  const partial = booking.paymentMode === "partial";
  return (
    <Link
      href={`/mobile/partner/trips/${trip.id}/travelers`}
      className="flex items-start gap-3 px-4 py-3"
    >
      <div className="relative shrink-0">
        <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-muted">
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>
        {unread && (
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Compass className="h-3 w-3 text-primary shrink-0" />
          <p
            className={cn(
              "text-xs truncate",
              unread ? "font-bold" : "font-semibold"
            )}
          >
            {trip.title}
          </p>
        </div>
        <p className="text-[11px] flex items-center gap-1 text-foreground/85">
          <Users className="h-2.5 w-2.5 shrink-0" />
          <span className="font-semibold">
            {booking.contact.firstName} {booking.contact.lastName}
          </span>{" "}
          booked
          {booking.tripTravelers > 1 && ` (${booking.tripTravelers} pax)`}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-[10px] text-muted-foreground">
            {relTime(booking.createdAt)}
          </p>
          <div className="flex items-center gap-1.5">
            {partial ? (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[9px] gap-0.5">
                <Wallet className="h-2.5 w-2.5" />
                Deposit · {formatMoney(booking.amountPaidNow)}
              </Badge>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[9px]">
                Paid · {formatMoney(booking.totalPrice)}
              </Badge>
            )}
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function NotificationsBackButton() {
  return (
    <Button asChild variant="ghost">
      <Link href="/mobile/partner">Dashboard</Link>
    </Button>
  );
}
