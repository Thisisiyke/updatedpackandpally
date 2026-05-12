"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Bell,
  Wallet,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/partner/settings/profile",
    label: "Profile",
    hint: "Public host page",
    icon: User,
  },
  {
    href: "/partner/settings/defaults",
    label: "Trip defaults",
    hint: "Pre-fill new trips",
    icon: Sliders,
  },
  {
    href: "/partner/settings/notifications",
    label: "Notifications",
    hint: "Email & push",
    icon: Bell,
  },
  {
    href: "/partner/settings/payouts",
    label: "Payouts & billing",
    hint: "Stripe, tax info",
    icon: Wallet,
  },
  {
    href: "/partner/settings/account",
    label: "Account & security",
    hint: "Login, danger zone",
    icon: ShieldCheck,
  },
];

export default function PartnerSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your host profile, defaults, and account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <nav className="space-y-1">
            {tabs.map((t) => {
              const active = pathname?.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted/40"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                      active
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <t.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        active ? "text-primary" : ""
                      )}
                    >
                      {t.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {t.hint}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
