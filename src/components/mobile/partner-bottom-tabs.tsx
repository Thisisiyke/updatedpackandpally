"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Wallet, User } from "lucide-react";
import { useConversations } from "@/hooks/use-conversations";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/mobile/partner", label: "Home", icon: Home, exact: true },
  {
    href: "/mobile/partner/messages",
    label: "Messages",
    icon: MessageCircle,
    exact: false,
  },
  {
    href: "/mobile/partner/payments",
    label: "Payments",
    icon: Wallet,
    exact: false,
  },
  {
    href: "/mobile/partner/profile",
    label: "Profile",
    icon: User,
    exact: false,
  },
];

export function PartnerBottomTabs() {
  const pathname = usePathname();
  const { totalUnread } = useConversations("partner");

  return (
    <nav className="sticky bottom-0 z-40 bg-white border-t md:pb-6">
      {/* host-mode indicator strip */}
      <div className="h-0.5 bg-gradient-to-r from-primary via-violet-500 to-primary" />
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname?.startsWith(tab.href);
          const showBadge = tab.label === "Messages" && totalUnread > 0;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <tab.icon
                  className={cn("h-5 w-5", active && "fill-primary/10")}
                  strokeWidth={active ? 2.5 : 2}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active && "font-bold"
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
