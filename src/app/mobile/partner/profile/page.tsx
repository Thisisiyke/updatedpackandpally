"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Star,
  ChevronRight,
  ArrowRightLeft,
  FileText,
  Bell,
  HelpCircle,
  LogOut,
  Compass,
  Sparkles,
  CreditCard,
  Unplug,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { PartnerBottomTabs } from "@/components/mobile/partner-bottom-tabs";
import { LogoutDialog } from "@/components/shared/logout-dialog";
import { CURRENT_PARTNER } from "@/data/conversations";
import { hosts } from "@/data/hosts";
import { CURRENT_PARTNER_HOST_ID } from "@/lib/host-terms";
import { disconnectStripe } from "@/lib/partner-stripe";
import { cn } from "@/lib/utils";

export default function MobilePartnerProfilePage() {
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [stripeConnectedAt, setStripeConnectedAt] = useState<string | null>(
    null
  );

  useEffect(() => {
    setStripeConnectedAt(
      localStorage.getItem("packpally_stripe_connected_at")
    );
  }, []);

  const hostProfile = hosts.find((h) => h.id === CURRENT_PARTNER_HOST_ID);

  const handleSwitchToTraveler = () => {
    router.push("/mobile/home");
  };

  const handleDisconnect = () => {
    if (
      !confirm(
        "Disconnect your Stripe account? You'll need to reconnect before you can host again."
      )
    )
      return;
    disconnectStripe();
    router.replace("/mobile/partner/onboarding");
  };

  const handleLogout = () => {
    router.push("/mobile");
  };

  return (
    <div className="relative flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Profile" showBack={false} />

      <div className="flex-1 overflow-y-auto pb-2">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary/10 via-white to-violet-500/10 px-5 py-6">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full ring-4 ring-white">
              <Image
                src={CURRENT_PARTNER.avatar}
                alt={CURRENT_PARTNER.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground">Hosting as</p>
              <p className="font-bold text-lg truncate">
                {CURRENT_PARTNER.name}
              </p>
              {hostProfile && (
                <div className="flex items-center gap-3 mt-0.5 text-[11px]">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{hostProfile.rating}</span>
                    <span className="text-muted-foreground">
                      ({hostProfile.reviewCount})
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {hostProfile.tripsHosted} trips hosted
                  </span>
                </div>
              )}
            </div>
          </div>

          {hostProfile && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {hostProfile.specialties.map((s) => (
                <Badge
                  key={s}
                  variant="secondary"
                  className="text-[10px]"
                >
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Switch to traveler — primary CTA */}
        <div className="px-5 mt-4">
          <button
            onClick={handleSwitchToTraveler}
            className="group w-full rounded-2xl border-2 border-primary bg-gradient-to-r from-primary to-violet-600 text-white p-4 flex items-center gap-3 shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 shrink-0">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-bold text-sm">Switch to traveler app</p>
              <p className="text-[11px] text-white/80 mt-0.5">
                Browse trips, book your next adventure
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Hosting menu */}
        <div className="px-5 mt-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Hosting
          </p>
          <div className="rounded-2xl bg-white border divide-y">
            <MenuRow
              icon={<Compass className="h-4 w-4 text-primary" />}
              label="Host dashboard"
              hint="Trips, bookings, FAB"
              href="/mobile/partner"
            />
            <MenuRow
              icon={<Sparkles className="h-4 w-4 text-primary" />}
              label="Create new trip"
              hint="6-step AI-assisted wizard"
              href="/mobile/partner/trips/new"
            />
            <MenuRow
              icon={<FileText className="h-4 w-4 text-primary" />}
              label="Terms & cancellation policy"
              hint="Edit your custom T&C"
              href="/mobile/partner/settings/terms"
            />
          </div>
        </div>

        {/* Account menu */}
        <div className="px-5 mt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Account
          </p>
          <div className="rounded-2xl bg-white border divide-y">
            <MenuRow
              icon={<CreditCard className="h-4 w-4 text-[#635BFF]" />}
              label="Payments & Stripe"
              hint={
                stripeConnectedAt
                  ? `Connected ${new Date(stripeConnectedAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" }
                    )}`
                  : "View earnings"
              }
              href="/mobile/partner/payments"
            />
            <MenuRow
              icon={<Bell className="h-4 w-4 text-muted-foreground" />}
              label="Notification preferences"
              hint="Email, SMS, push"
              href="#"
            />
            <MenuRow
              icon={<HelpCircle className="h-4 w-4 text-muted-foreground" />}
              label="Help & support"
              hint="FAQs, contact"
              href="#"
            />
          </div>
        </div>

        {/* Danger zone */}
        <div className="px-5 mt-4 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Account actions
          </p>
          <div className="rounded-2xl bg-white border divide-y">
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                <Unplug className="h-4 w-4 text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-amber-800">
                  Disconnect Stripe
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Pauses hosting until reconnected
                </p>
              </div>
            </button>
            <button
              onClick={() => setLogoutOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                <LogOut className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-red-700">Sign out</p>
                <p className="text-[11px] text-muted-foreground">
                  End your session
                </p>
              </div>
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-4">
          Pack &amp; Pally · Host mode
        </p>
      </div>

      <PartnerBottomTabs />

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}

function MenuRow({
  icon,
  label,
  hint,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors",
        href === "#" && "pointer-events-none opacity-60"
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{label}</p>
        <p className="text-[11px] text-muted-foreground truncate">{hint}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </Link>
  );
}
