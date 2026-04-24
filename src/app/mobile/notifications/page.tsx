"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  Plane,
  Hotel as HotelIcon,
  Compass,
  Tag,
  MessageCircle,
  Check,
  CheckCheck,
  Sparkles,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileHeader } from "@/components/mobile/mobile-header";
import {
  getAllRemindersForMe,
  isReminderRead,
  markReminderRead,
  subscribeToNotifications,
  markAllRead as markAllRemindersRead,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

type NotifType =
  | "booking"
  | "flight"
  | "hotel"
  | "promo"
  | "message"
  | "ai"
  | "payment-email"
  | "payment-sms"
  | "payment-push";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  link?: string;
  image?: string;
}

const seed: Notification[] = [
  {
    id: "n1",
    type: "booking",
    title: "Booking confirmed — Amalfi Coast",
    body: "Your group trip is all set. Itinerary has been emailed.",
    time: "2 min ago",
    read: false,
    link: "/mobile/bookings",
  },
  {
    id: "n2",
    type: "flight",
    title: "Check-in is now open",
    body: "New York → Paris · Departs 24 hours from now",
    time: "3 hr ago",
    read: false,
    link: "/mobile/bookings",
  },
  {
    id: "n3",
    type: "ai",
    title: "Pally has new suggestions",
    body: "We found 3 trips matching your recent searches.",
    time: "5 hr ago",
    read: false,
    link: "/mobile/ai/chatbot",
  },
  {
    id: "n4",
    type: "hotel",
    title: "Hotel confirmation",
    body: "Kyoto Zen Garden · Check-in May 20",
    time: "Yesterday",
    read: true,
    link: "/mobile/bookings",
  },
  {
    id: "n5",
    type: "message",
    title: "Sofia sent you a message",
    body: "Welcome to the Amalfi trip! Here's what to pack...",
    time: "Yesterday",
    read: true,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "n6",
    type: "promo",
    title: "20% off Bali wellness retreats",
    body: "Limited-time offer. Book by April 30.",
    time: "2 days ago",
    read: true,
    link: "/mobile/search/trips",
  },
  {
    id: "n7",
    type: "booking",
    title: "Payment received",
    body: "$2,499 charged to Visa ending in 4829",
    time: "3 days ago",
    read: true,
  },
];

const typeConfig: Record<NotifType, { icon: any; color: string }> = {
  booking: { icon: Compass, color: "text-primary bg-primary/10" },
  flight: { icon: Plane, color: "text-blue-600 bg-blue-50" },
  hotel: { icon: HotelIcon, color: "text-emerald-600 bg-emerald-50" },
  promo: { icon: Tag, color: "text-amber-600 bg-amber-50" },
  message: { icon: MessageCircle, color: "text-violet-600 bg-violet-50" },
  ai: { icon: Sparkles, color: "text-pink-600 bg-pink-50" },
  "payment-email": { icon: Mail, color: "text-blue-600 bg-blue-50" },
  "payment-sms": { icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
  "payment-push": { icon: Bell, color: "text-primary bg-primary/10" },
};

function reminderRelTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const d = Math.round(hr / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function groupByTime(items: Notification[]) {
  const today: Notification[] = [];
  const earlier: Notification[] = [];
  items.forEach((n) => {
    const isTodayish =
      n.time.includes("min") ||
      n.time.includes("hr") ||
      n.time.includes("sec") ||
      n.time === "Just now";
    if (isTodayish) today.push(n);
    else earlier.push(n);
  });
  return { today, earlier };
}

export default function MobileNotificationsPage() {
  const [mockItems, setMockItems] = useState(seed);
  const [liveTick, setLiveTick] = useState(0);
  const [tab, setTab] = useState<"all" | "unread">("all");

  // Re-fetch live reminders whenever the store changes
  useEffect(() => subscribeToNotifications(() => setLiveTick((t) => t + 1)), []);

  const liveItems: Notification[] = useMemo(() => {
    void liveTick; // subscription trigger
    return getAllRemindersForMe().map<Notification>((r) => {
      const type: NotifType =
        r.channel === "email"
          ? "payment-email"
          : r.channel === "sms"
          ? "payment-sms"
          : "payment-push";
      const title =
        r.channel === "email"
          ? r.subject || "Payment reminder from your host"
          : r.channel === "sms"
          ? `${r.senderName} texted you`
          : `${r.senderName} · Pack & Pally`;
      return {
        id: r.id,
        type,
        title,
        body: r.body.replace(/\s+/g, " ").slice(0, 140),
        time: reminderRelTime(r.sentAt),
        read: isReminderRead(r.id),
        link: `/mobile/notifications/${r.id}`,
      };
    });
  }, [liveTick]);

  // Live payment reminders first (most relevant), then mock demo items
  const items = [...liveItems, ...mockItems];

  const filtered = tab === "unread" ? items.filter((i) => !i.read) : items;
  const { today, earlier } = groupByTime(filtered);
  const unreadCount = items.filter((i) => !i.read).length;

  const markAllRead = () => {
    setMockItems((prev) => prev.map((i) => ({ ...i, read: true })));
    markAllRemindersRead();
    setLiveTick((t) => t + 1);
  };
  const markOne = (id: string) => {
    // Mock items
    setMockItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, read: true } : i))
    );
    // Live reminder
    markReminderRead(id);
    setLiveTick((t) => t + 1);
  };

  const renderNotif = (n: Notification) => {
    const config = typeConfig[n.type];
    const Icon = config.icon;

    const content = (
      <div
        className={cn(
          "relative flex gap-3 rounded-2xl border p-3 transition-colors",
          !n.read ? "bg-primary/5 border-primary/20" : "bg-white hover:bg-muted/30"
        )}
      >
        {n.image ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
            <Image
              src={n.image}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        ) : (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
              config.color
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm leading-tight line-clamp-1",
              !n.read ? "font-bold" : "font-semibold"
            )}
          >
            {n.title}
          </p>
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
            {n.body}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
        </div>

        {!n.read && (
          <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
    );

    return (
      <div key={n.id} onClick={() => markOne(n.id)}>
        {n.link ? <Link href={n.link}>{content}</Link> : content}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[844px] bg-muted/20">
      <MobileHeader
        title="Notifications"
        action={
          unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs font-semibold text-primary"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="bg-white px-4 pb-3 border-b">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setTab("all")}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
              tab === "all" ? "bg-white shadow-sm" : "text-muted-foreground"
            )}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setTab("unread")}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
              tab === "unread" ? "bg-white shadow-sm" : "text-muted-foreground"
            )}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Bell className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-sm">You're all caught up</p>
            <p className="text-xs text-muted-foreground mt-1">
              New notifications will appear here
            </p>
          </div>
        ) : (
          <>
            {today.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  Today
                </h3>
                <div className="space-y-2">{today.map(renderNotif)}</div>
              </div>
            )}

            {earlier.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                  Earlier
                </h3>
                <div className="space-y-2">{earlier.map(renderNotif)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
