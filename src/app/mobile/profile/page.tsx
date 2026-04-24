"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Settings,
  CreditCard,
  Bell,
  Globe,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  Share2,
  Star,
  MapPin,
  Compass,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useConversations } from "@/hooks/use-conversations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomTabs } from "@/components/mobile/bottom-tabs";
import { MobileHeader } from "@/components/mobile/mobile-header";
import { LogoutDialog } from "@/components/shared/logout-dialog";
import { isStripeConnected } from "@/lib/partner-stripe";

const menuSections = [
  {
    title: "Account",
    items: [
      {
        icon: MessageCircle,
        label: "Messages",
        hint: "Chat with your hosts",
        href: "/mobile/messages",
      },
      {
        icon: Settings,
        label: "Account settings",
        hint: "Edit your profile",
        href: "/mobile/settings/account",
      },
      {
        icon: CreditCard,
        label: "Payment methods",
        hint: "1 card saved",
        href: "/mobile/settings/payment",
      },
      {
        icon: Bell,
        label: "Notifications",
        hint: "Manage alerts",
        href: "/mobile/settings/notifications",
      },
      {
        icon: Globe,
        label: "Language & region",
        hint: "English, USD",
        href: "/mobile/settings/language",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        icon: HelpCircle,
        label: "Help Center",
        hint: "FAQ & guides",
        href: "#",
      },
      { icon: Shield, label: "Safety", hint: "Travel safely", href: "#" },
      {
        icon: FileText,
        label: "Terms & Privacy",
        hint: "Legal info",
        href: "#",
      },
    ],
  },
];

export default function MobileProfilePage() {
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { totalUnread } = useConversations("user");
  const [isHosting, setIsHosting] = useState(false);

  useEffect(() => {
    setIsHosting(isStripeConnected());
  }, []);

  const handleLogout = () => {
    router.push("/mobile");
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader title="Profile" showBack={false} />

      <div className="flex-1 overflow-y-auto">
        {/* User card */}
        <div className="bg-white border-b px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-primary/10 shrink-0">
              <span className="flex h-full w-full items-center justify-center text-xl font-bold text-primary">
                E
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold truncate">Explorer</h2>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                  Traveler
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                explorer@packandpally.com
              </p>
              <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
                Edit profile
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-lg font-bold">7</p>
              <p className="text-[10px] text-muted-foreground">Trips</p>
            </div>
            <div className="text-center border-x">
              <p className="text-lg font-bold">4</p>
              <p className="text-[10px] text-muted-foreground">Countries</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold flex items-center justify-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                4.9
              </p>
              <p className="text-[10px] text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>

        {/* Hosting card — swaps between "Start hosting" and "Host dashboard" */}
        <div className="px-5 mt-4">
          {isHosting ? (
            <Link
              href="/mobile/partner"
              className="block rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-violet-500/5 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold flex items-center gap-1.5">
                    Host dashboard
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[9px]">
                      Active
                    </Badge>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    Manage your trips and create new ones from your phone.
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground self-center shrink-0" />
              </div>
            </Link>
          ) : (
            <Link
              href="/mobile/partner/onboarding"
              className="block rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 shrink-0">
                  <Compass className="h-5 w-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Start hosting</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    Connect with Stripe and create your first group trip right
                    from your phone.
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground self-center shrink-0" />
              </div>
            </Link>
          )}
        </div>

        {/* Menu sections */}
        <div className="px-5 mt-4 space-y-4">
          {menuSections.map((section) => (
            <div key={section.title}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                {section.title}
              </p>
              <div className="rounded-2xl bg-white border divide-y">
                {section.items.map((item) => {
                  const showMsgBadge =
                    item.label === "Messages" && totalUnread > 0;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 p-3.5 hover:bg-muted/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.hint}
                        </p>
                      </div>
                      {showMsgBadge && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                          {totalUnread}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Invite */}
          <button className="w-full rounded-2xl bg-white border p-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Share2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium">Invite friends</p>
              <p className="text-[10px] text-muted-foreground">
                Earn $50 credit per invite
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Logout */}
          <button
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 py-3"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>

          <p className="text-center text-[10px] text-muted-foreground pb-3">
            Pack & Pally v1.0.0
          </p>
        </div>
      </div>

      <BottomTabs />

      <LogoutDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
