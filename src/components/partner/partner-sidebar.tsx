"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  CalendarCheck,
  Wallet,
  Settings,
  LogOut,
  Sparkles,
  Compass,
  MessageCircle,
  CreditCard,
} from "lucide-react";
import { usePackPallyAuth } from "@/components/providers/session-provider";
import { useTravelerMessagesApi } from "@/hooks/use-traveler-messages-api";
import { hostNeedsStripeConnect } from "@/lib/host-needs-stripe-connect";
import { cn } from "@/lib/utils";

/** Payouts / Stripe are always the first row (`stripeNav`) so hosts always see Connect or Payouts. */
const defaultNavItems = [
  { href: "/partner", label: "Overview", icon: LayoutDashboard },
  { href: "/partner/listings", label: "Listings", icon: Building2 },
  { href: "/partner/trips", label: "Group Trips", icon: Compass },
  { href: "/partner/calendar", label: "Calendar", icon: Calendar },
  { href: "/partner/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/partner/messages", label: "Messages", icon: MessageCircle },
];

export function PartnerSidebar() {
  const pathname = usePathname();
  const { user } = usePackPallyAuth();
  const needsStripe = hostNeedsStripeConnect(user ?? undefined);

  const stripeNav = needsStripe
    ? {
        href: "/partner/onboarding/stripe",
        label: "Connect Stripe",
        icon: CreditCard,
        urgent: true as const,
      }
    : {
        href: "/partner/payouts",
        label: "Payouts",
        icon: Wallet,
        urgent: false as const,
      };

  const navItems = [stripeNav, ...defaultNavItems];
  const inboxEnabled = Boolean(user?.id) && user?.role !== "guest";
  const { totalUnread, hydrated: inboxLoaded } = useTravelerMessagesApi(
    inboxEnabled
  );

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-60 shrink-0 border-r bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6 rounded-lg bg-primary/5 p-3 border border-primary/10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary">
              Partner Portal
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your properties & bookings
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/partner"
                ? pathname === "/partner"
                : pathname.startsWith(item.href);

            const showBadge =
              item.href === "/partner/messages" &&
              inboxLoaded &&
              totalUnread > 0;

            const urgent = Boolean(
              "urgent" in item && (item as { urgent?: boolean }).urgent
            );

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  urgent &&
                    (active
                      ? "border border-amber-400 bg-amber-50 text-amber-950 ring-2 ring-amber-300"
                      : "border border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100"),
                  !urgent &&
                    (active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground")
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                {showBadge && (
                  <span
                    className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground"
                    aria-label={`${totalUnread} unread messages`}
                  >
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4 space-y-1">
        <Link
          href="/partner/settings/terms"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname.startsWith("/partner/settings")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Exit partner
        </Link>
      </div>
    </aside>
  );
}
