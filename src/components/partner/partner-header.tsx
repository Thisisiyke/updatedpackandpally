"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  MessageCircle,
  Settings,
  LayoutDashboard,
  Compass,
  Calendar,
  CalendarCheck,
  Wallet,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CURRENT_PARTNER } from "@/data/conversations";
import { useConversations } from "@/hooks/use-conversations";
import { FEATURE_FLAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const allNavItems = [
  { href: "/partner", label: "Overview", icon: LayoutDashboard, gated: false },
  {
    href: "/partner/listings",
    label: "Listings",
    icon: Building2,
    gated: !FEATURE_FLAGS.hostPropertyListings,
  },
  { href: "/partner/trips", label: "Group Trips", icon: Compass, gated: false },
  {
    href: "/partner/calendar",
    label: "Calendar",
    icon: Calendar,
    gated: !FEATURE_FLAGS.hostPropertyListings,
  },
  {
    href: "/partner/bookings",
    label: "Bookings",
    icon: CalendarCheck,
    gated: !FEATURE_FLAGS.hostPropertyListings,
  },
  {
    href: "/partner/messages",
    label: "Messages",
    icon: MessageCircle,
    gated: false,
  },
  { href: "/partner/payouts", label: "Payouts", icon: Wallet, gated: false },
];

export function PartnerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalUnread } = useConversations("partner");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const visibleNav = allNavItems.filter((i) => !i.gated);

  return (
    <header className="sticky top-0 z-30 h-14 border-b bg-white">
      <div className="flex h-full items-center gap-3 px-4 lg:px-6">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileNavOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>

        {/* Logo */}
        <Link
          href="/partner"
          className="flex items-center gap-2 shrink-0"
        >
          <Image
            src="/logo.png"
            alt="Pack & Pally"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-bold">Pack &amp; Pally</p>
            <p className="text-[10px] text-muted-foreground -mt-0.5">
              Host portal
            </p>
          </div>
        </Link>

        <div className="flex-1" />

        {/* Right cluster */}
        <Link
          href="/partner/messages"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Messages"
          title="Messages"
        >
          <MessageCircle className="h-4 w-4" />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
              {totalUnread}
            </span>
          )}
        </Link>

        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 rounded-full hover:bg-muted px-1.5 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-muted shrink-0">
              <Image
                src={CURRENT_PARTNER.avatar}
                alt={CURRENT_PARTNER.name}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block font-semibold">
                {CURRENT_PARTNER.name}
              </span>
              <span className="block text-xs text-muted-foreground font-normal">
                Host account
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => router.push("/partner/settings")}
              className="cursor-pointer"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => router.push("/")}
              className="cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Exit host portal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden border-t bg-white">
          <nav className="px-3 py-2 space-y-1">
            {visibleNav.map((item) => {
              const active =
                item.href === "/partner"
                  ? pathname === "/partner"
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
