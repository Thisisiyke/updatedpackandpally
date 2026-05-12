"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  ShieldAlert,
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  AlertTriangle,
  Menu,
  X,
  Compass,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getAdminStats } from "@/data/admin";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/partners", label: "Partners", icon: Building2 },
  { href: "/admin/trips", label: "Trips", icon: Compass },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
];

const ADMIN_NAME = "Platform Admin";
const ADMIN_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const stats = getAdminStats();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-white/10 bg-slate-900 text-white">
      <div className="flex h-full items-center gap-3 px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden text-white/80 hover:bg-white/10 hover:text-white"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileNavOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>

        <Link href="/admin" className="flex items-center gap-2 shrink-0">
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
            <p className="text-[10px] text-red-300 -mt-0.5 flex items-center gap-1">
              <ShieldAlert className="h-2.5 w-2.5" />
              Admin panel
            </p>
          </div>
        </Link>

        <div className="flex-1" />

        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {stats.openDisputes > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {stats.openDisputes}
            </span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 rounded-full hover:bg-white/10 px-1.5 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              />
            }
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-white/10 shrink-0">
              <Image
                src={ADMIN_AVATAR}
                alt={ADMIN_NAME}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-white/60 hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block font-semibold">{ADMIN_NAME}</span>
              <span className="block text-xs text-muted-foreground font-normal">
                Operations & oversight
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => router.push("/admin")}
              className="cursor-pointer"
            >
              <Settings className="h-4 w-4 mr-2" />
              Admin home
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => router.push("/")}
              className="cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Exit admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {mobileNavOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-900">
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href);
              const badge =
                item.href === "/admin/disputes" ? stats.openDisputes : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  {badge && badge > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
