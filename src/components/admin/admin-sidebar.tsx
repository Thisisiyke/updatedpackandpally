"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  AlertTriangle,
  ShieldAlert,
  LogOut,
  Shield,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminStats } from "@/data/admin";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/partners", label: "Partners", icon: Building2 },
  { href: "/admin/trips", label: "Trips", icon: Compass },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const stats = getAdminStats();

  return (
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-white/10 bg-slate-900 text-white flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6 rounded-lg bg-red-500/10 p-3 border border-red-500/20">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <span className="text-xs font-semibold text-red-300">
              Admin Panel
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Platform operations & oversight
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            // Show badge for disputes
            const badge =
              item.href === "/admin/disputes" ? stats.openDisputes : null;

            return (
              <Link
                key={item.href}
                href={item.href}
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
                  <span
                    className={cn(
                      "flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold",
                      item.href === "/admin/disputes"
                        ? "bg-red-500 text-white"
                        : "bg-amber-500 text-white"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Exit admin
        </Link>
      </div>
    </aside>
  );
}
