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
} from "lucide-react";
import { useConversations } from "@/hooks/use-conversations";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/partner", label: "Overview", icon: LayoutDashboard },
  { href: "/partner/listings", label: "Listings", icon: Building2 },
  { href: "/partner/trips", label: "Group Trips", icon: Compass },
  { href: "/partner/calendar", label: "Calendar", icon: Calendar },
  { href: "/partner/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/partner/messages", label: "Messages", icon: MessageCircle },
  { href: "/partner/payouts", label: "Payouts", icon: Wallet },
];

export function PartnerSidebar() {
  const pathname = usePathname();
  const { totalUnread } = useConversations("partner");

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
              item.href === "/partner/messages" && totalUnread > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                {showBadge && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                    {totalUnread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4 space-y-1">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
